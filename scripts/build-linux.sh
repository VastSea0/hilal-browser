#!/usr/bin/env bash
# scripts/build-linux.sh
#
# Convenience wrapper around `./mach build` and `./mach package` for Hilal on Linux.
# Integration: Flatpak and AppImage steps can be triggered via this script.
#
# Usage:
#   scripts/build-linux.sh                 # Default: full build
#   scripts/build-linux.sh build           # Explicit full build
#   scripts/build-linux.sh faster          # Front-end only build
#   scripts/build-linux.sh binaries        # C++/Rust only build
#   scripts/build-linux.sh no-lag          # Build using only 75% of CPU cores
#   scripts/build-linux.sh run             # Build and run
#   scripts/build-linux.sh package         # Package only
#   scripts/build-linux.sh flatpak-build   # Package and then build Flatpak bundle
#   scripts/build-linux.sh flatpak-install # Package and then install Flatpak to user space
#   scripts/build-linux.sh appimage-build  # Package and then build AppImage
#   scripts/build-linux.sh appimage-run    # Package, build AppImage, and run it

set -euo pipefail

# shellcheck source=lib.sh
. "$(dirname "$0")/lib.sh"

require_firefox_src

if [ "$(uname -s)" != "Linux" ]; then
  warn "This script is tuned for Linux. On macOS, please use build-macos.sh."
fi

# --- INITIALIZATION OPERATIONS (Always run at the very beginning) ---
log "Initializing build environment..."

# Ensure patches and branding are applied
bash "$(dirname "$0")/apply.sh"

# Copy Linux mozconfig
if [ -f "$(dirname "$0")/../mozconfigs/linux" ]; then
  log "Copying mozconfigs/linux -> firefox/mozconfig"
  cp "$(dirname "$0")/../mozconfigs/linux" "$HILAL_FIREFOX_SRC/mozconfig"
fi

# Status variables
build_active=0
run_after=0
package_after=0
no_lag_active=0
cli_active=0
flatpak_build_after=0
flatpak_install_after=0
appimage_build_after=0
appimage_run_after=0

# Sub-arguments for compilation and CLI
build_sub_args=()
cli_sub_args=()

# Automatic packaging trigger
if [ ! -t 0 ] || [ -n "${HILAL_AUTO_PACKAGE:-}" ]; then
  package_after=1
fi

# Default to build step if no arguments are passed
if [ $# -eq 0 ] && [ "$package_after" -eq 0 ]; then
  build_active=1
fi

# Parameter analysis
last_defined_arg=""
unknown_params=()

while [ $# -gt 0 ]; do
  case "$1" in
    build)
      build_active=1
      last_defined_arg="build"
      shift
      ;;
    faster)
      build_active=1
      build_sub_args+=("faster")
      last_defined_arg="faster"
      shift
      ;;
    binaries)
      build_active=1
      build_sub_args+=("binaries")
      last_defined_arg="binaries"
      shift
      ;;
    no-lag)
      no_lag_active=1
      last_defined_arg="no-lag"
      shift
      ;;
    run)
      run_after=1
      last_defined_arg="run"
      shift
      ;;
    package)
      package_after=1
      last_defined_arg="package"
      shift
      ;;
    flatpak-build)
      package_after=1
      flatpak_build_after=1
      last_defined_arg="flatpak-build"
      shift
      ;;
    flatpak-install)
      package_after=1
      flatpak_install_after=1
      last_defined_arg="flatpak-install"
      shift
      ;;
    appimage-build)
      package_after=1
      appimage_build_after=1
      last_defined_arg="appimage-build"
      shift
      ;;
    appimage-run)
      package_after=1
      appimage_run_after=1
      last_defined_arg="appimage-run"
      shift
      ;;
    cli)
      cli_active=1
      last_defined_arg="cli"
      shift
      ;;
    *)
      if [ -n "$last_defined_arg" ]; then
        if [ "$last_defined_arg" = "build" ] || [ "$last_defined_arg" = "faster" ] || [ "$last_defined_arg" = "binaries" ]; then
          build_active=1
          build_sub_args+=("$1")
        elif [ "$last_defined_arg" = "cli" ]; then
          cli_active=1
          cli_sub_args+=("$1")
        elif [ "$last_defined_arg" = "run" ]; then
          warn "Note: Unknown extra parameter passed for 'run' step: $1"
        fi
      else
        unknown_params+=("$1")
        build_active=1
        build_sub_args+=("$1")
      fi
      shift
      ;;
  esac
done

# Dynamic array to list execution steps
declare -a steps=()

# Gather steps
if [ $build_active -eq 1 ]; then
  lag_flag=""
  if [ $no_lag_active -eq 1 ]; then
    cpu=$(grep -c ^processor /proc/cpuinfo)
    process=$(( cpu * 75 / 100 ))
    [ $process -lt 1 ] && process=1
    lag_flag="-j${process}"
  fi
  
  if [ -n "$lag_flag" ]; then
    steps+=("BUILD: ./mach build ${build_sub_args[*]:-} $lag_flag")
  else
    steps+=("BUILD: ./mach build ${build_sub_args[*]:-}")
  fi
fi

if [ "$run_after" = 1 ]; then
  steps+=("RUN: ./mach run")
fi

if [ "$cli_active" = 1 ]; then
  steps+=("CLI: ./mach cli ${cli_sub_args[*]:-}")
fi

if [ "$package_after" = 1 ]; then
  steps+=("PACKAGE: ./mach package")
fi

if [ "$flatpak_build_after" = 1 ]; then
  steps+=("FLATPAK-BUILD: ./scripts/build-flatpak.sh build")
fi

if [ "$flatpak_install_after" = 1 ]; then
  steps+=("FLATPAK-INSTALL: ./scripts/build-flatpak.sh install")
fi

if [ "$appimage_build_after" = 1 ]; then
  steps+=("APPIMAGE-BUILD: ./scripts/build-appimage.sh build")
fi

if [ "$appimage_run_after" = 1 ]; then
  steps+=("APPIMAGE-RUN: ./scripts/build-appimage.sh run")
fi

# --- STEP VALIDATION AND AUTOMATIC CORRECTION MECHANISM ---
# If Flatpak or AppImage steps are present in the list and no PACKAGE step 
# is running before them, this automatically injects a PACKAGE step.
validate_and_fix_steps() {
  local has_external_packaging=0
  local packaging_first_idx=-1
  local has_package_before=0

  # Scan steps
  for i in "${!steps[@]}"; do
    if [[ "${steps[$i]}" =~ ^FLATPAK- ]] || [[ "${steps[$i]}" =~ ^APPIMAGE- ]]; then
      if [ $has_external_packaging -eq 0 ]; then
        has_external_packaging=1
        packaging_first_idx=$i
      fi
    elif [[ "${steps[$i]}" =~ ^PACKAGE: ]]; then
      # If a package step is found and is before the external packaging step, it is considered valid.
      if [ $has_external_packaging -eq 0 ] || [ "$i" -lt "$packaging_first_idx" ]; then
        has_package_before=1
      fi
    fi
  done

  # If a Flatpak or AppImage step exists but there is no packaging step before it, inject it mandatorily.
  if [ $has_external_packaging -eq 1 ] && [ $has_package_before -eq 0 ]; then
    log "Mandatory Check: Flatpak or AppImage steps detected but no PACKAGE step was found before them."
    log "The PACKAGE step has been automatically added before the first packaging step so that packages can use the local build outputs!"
    
    local corrected_steps=()
    for i in "${!steps[@]}"; do
      if [ "$i" -eq "$packaging_first_idx" ]; then
        corrected_steps+=("PACKAGE: ./mach package")
      fi
      corrected_steps+=("${steps[$i]}")
    done
    steps=("${corrected_steps[@]}")
  fi
}

# Initial run check
validate_and_fix_steps

# Exit if no actions are scheduled
if [ ${#steps[@]} -eq 0 ]; then
  log "No execution steps scheduled."
  exit 0
fi

# --- INTERACTIVE ORDERING AND APPROVAL MECHANISM ---
if [ -t 0 ]; then
  COLOR_RESET="\033[0m"
  COLOR_BOLD="\033[1m"
  COLOR_RED="\033[1;31m"
  COLOR_GREEN="\033[1;32m"
  COLOR_YELLOW="\033[1;33m"
  COLOR_BLUE="\033[1;34m"
  COLOR_CYAN="\033[1;36m"
  COLOR_MAGENTA="\033[1;35m"

  while true; do
    # Re-validate the list and auto-correct gaps at the beginning of each interactive loop
    validate_and_fix_steps

    printf "${COLOR_CYAN}==================================================${COLOR_RESET}\n"
    printf "${COLOR_BOLD}OPERATION STEP ORDERING:${COLOR_RESET}\n"
    printf "${COLOR_CYAN}==================================================${COLOR_RESET}\n"
    
    for i in "${!steps[@]}"; do
      step_text="${steps[$i]}"
      if [[ "$step_text" =~ ^BUILD: ]]; then
        printf "  ${COLOR_GREEN}%d${COLOR_RESET} -> ${COLOR_CYAN}%s${COLOR_RESET}\n" "$((i+1))" "$step_text"
      elif [[ "$step_text" =~ ^RUN: ]]; then
        printf "  ${COLOR_GREEN}%d${COLOR_RESET} -> ${COLOR_GREEN}%s${COLOR_RESET}\n" "$((i+1))" "$step_text"
      elif [[ "$step_text" =~ ^CLI: ]]; then
        printf "  ${COLOR_GREEN}%d${COLOR_RESET} -> ${COLOR_YELLOW}%s${COLOR_RESET}\n" "$((i+1))" "$step_text"
      elif [[ "$step_text" =~ ^PACKAGE: ]]; then
        printf "  ${COLOR_GREEN}%d${COLOR_RESET} -> ${COLOR_BLUE}%s${COLOR_RESET}\n" "$((i+1))" "$step_text"
      elif [[ "$step_text" =~ ^FLATPAK-BUILD: ]]; then
        printf "  ${COLOR_GREEN}%d${COLOR_RESET} -> ${COLOR_MAGENTA}%s${COLOR_RESET}\n" "$((i+1))" "$step_text"
      elif [[ "$step_text" =~ ^FLATPAK-INSTALL: ]]; then
        printf "  ${COLOR_GREEN}%d${COLOR_RESET} -> ${COLOR_RED}%s${COLOR_RESET}\n" "$((i+1))" "$step_text"
      elif [[ "$step_text" =~ ^APPIMAGE-BUILD: ]]; then
        printf "  ${COLOR_GREEN}%d${COLOR_RESET} -> ${COLOR_MAGENTA}%s${COLOR_RESET}\n" "$((i+1))" "$step_text"
      elif [[ "$step_text" =~ ^APPIMAGE-RUN: ]]; then
        printf "  ${COLOR_GREEN}%d${COLOR_RESET} -> ${COLOR_GREEN}%s${COLOR_RESET}\n" "$((i+1))" "$step_text"
      else
        printf "  ${COLOR_GREEN}%d${COLOR_RESET} -> ${COLOR_MAGENTA}%s${COLOR_RESET}\n" "$((i+1))" "$step_text"
      fi
    done
    printf "${COLOR_CYAN}==================================================${COLOR_RESET}\n"
    
    if [ ${#unknown_params[@]} -gt 0 ]; then
      warn "Warning: Undefined parameters detected and included in processing: ${unknown_params[*]}"
    fi
    
    if [ $no_lag_active -eq 1 ]; then
      no_lag_status="${COLOR_GREEN}${COLOR_BOLD}ACTIVE (75% CPU Limit)${COLOR_RESET}"
    else
      no_lag_status="${COLOR_RED}${COLOR_BOLD}DISABLED (Full CPU Power)${COLOR_RESET}"
    fi
    
    printf "${COLOR_BOLD}Options:${COLOR_RESET}\n"
    printf "  [${COLOR_GREEN}y${COLOR_RESET}/Confirm]   : Confirm this order and start operations.\n"
    printf "  [${COLOR_RED}N${COLOR_RESET}]           : Exit / Cancel.\n"
    printf "  [${COLOR_YELLOW}n${COLOR_RESET}]           : Toggle No-Lag mode (Current Status: %b)\n" "$no_lag_status"
    printf "  [${COLOR_CYAN}Num Num${COLOR_RESET}]     : Swap the positions of two steps (e.g., '2 3' to swap steps 2 and 3).\n"
    printf "  [${COLOR_CYAN}Num del${COLOR_RESET}]     : Remove a step from the list (e.g., '3 del' to remove the 3rd step).\n"
    printf "  [${COLOR_CYAN}Num new${COLOR_RESET}]     : Add a new step at a specific index (e.g., '2 new' to add at the 2nd position).\n"
    printf "${COLOR_CYAN}--------------------------------------------------${COLOR_RESET}\n"
    
    read -rp "Your choice: " response
    echo ""
    
    if [ "$response" = "N" ] || [ "$response" = "exit" ]; then
      log "Operation cancelled by user."
      exit 1
    elif [[ "$response" =~ ^[Yy]$ ]] || [ -z "$response" ]; then
      validate_and_fix_steps
      break
    elif [ "$response" = "n" ]; then
      no_lag_active=$((1 - no_lag_active))
      
      cpu=$(grep -c ^processor /proc/cpuinfo)
      process=$(( cpu * 75 / 100 ))
      [ $process -lt 1 ] && process=1
      
      for idx in "${!steps[@]}"; do
        if [[ "${steps[$idx]}" =~ ^BUILD: ]]; then
          clean_step=$(echo "${steps[$idx]}" | sed -E 's/ -j[0-9]+//g')
          if [ $no_lag_active -eq 1 ]; then
            steps[$idx]="$clean_step -j${process}"
          else
            steps[$idx]="$clean_step"
          fi
        fi
      done
      
      if [ $no_lag_active -eq 1 ]; then
        printf "${COLOR_YELLOW}No-lag mode enabled! The compilation will run with %d cores (%s75 CPU power).${COLOR_RESET}\n" "$process" "%"
      else
        printf "${COLOR_RED}No-lag mode disabled! The compilation will run using all CPU cores.${COLOR_RESET}\n"
      fi
      echo ""
    elif [[ "$response" =~ ^([0-9]+)[[:space:]]+(del|delete)$ ]]; then
      idx=$(echo "$response" | awk '{print $1}')
      real_idx=$((idx - 1))
      
      if [ $real_idx -ge 0 ] && [ $real_idx -lt ${#steps[@]} ]; then
        new_steps=()
        for i in "${!steps[@]}"; do
          if [ "$i" -ne "$real_idx" ]; then
            new_steps+=("${steps[$i]}")
          fi
        done
        steps=("${new_steps[@]}")
        log "Step $idx has been removed."
        echo ""
        
        if [ ${#steps[@]} -eq 0 ]; then
          log "No steps left in the list. Exiting."
          exit 0
        fi
      else
        warn "Invalid step number!"
        echo ""
      fi
    elif [[ "$response" =~ ^([0-9]+)[[:space:]]+(new)$ ]]; then
      idx=$(echo "$response" | awk '{print $1}')
      N=${#steps[@]}
      real_idx=$((idx - 1))
      
      if [ $real_idx -lt 0 ]; then real_idx=0; fi
      if [ $real_idx -gt "$N" ]; then real_idx=$N; fi
      
      echo "Select the step type to add (Position: $((real_idx + 1))):"
      echo "  1) BUILD (Full Build / mach build)"
      echo "  2) RUN (Run Hilal / mach run)"
      echo "  3) PACKAGE (Package Hilal / mach package)"
      echo "  4) FLATPAK-BUILD (Build local Flatpak Bundle)"
      echo "  5) FLATPAK-INSTALL (Build and Install Flatpak to user)"
      echo "  6) APPIMAGE-BUILD (Build local AppImage Bundle)"
      echo "  7) APPIMAGE-RUN (Build and Run AppImage)"
      echo "  8) CUSTOM COMMAND (Run any custom bash command)"
      read -rp "Your choice (1-8): " choice
      echo ""
      
      new_step=""
      case "$choice" in
        1)
          if [ $no_lag_active -eq 1 ]; then
            cpu=$(grep -c ^processor /proc/cpuinfo)
            process=$(( cpu * 75 / 100 ))
            [ $process -lt 1 ] && process=1
            new_step="BUILD: ./mach build -j${process}"
          else
            new_step="BUILD: ./mach build"
          fi
          build_active=1
          ;;
        2)
          new_step="RUN: ./mach run"
          run_after=1
          ;;
        3)
          new_step="PACKAGE: ./mach package"
          package_after=1
          ;;
        4)
          new_step="FLATPAK-BUILD: ./scripts/build-flatpak.sh build"
          flatpak_build_after=1
          ;;
        5)
          new_step="FLATPAK-INSTALL: ./scripts/build-flatpak.sh install"
          flatpak_install_after=1
          ;;
        6)
          new_step="APPIMAGE-BUILD: ./scripts/build-appimage.sh build"
          appimage_build_after=1
          ;;
        7)
          new_step="APPIMAGE-RUN: ./scripts/build-appimage.sh run"
          appimage_run_after=1
          ;;
        8)
          read -rp "Enter the custom command to run: " custom_cmd
          new_step="CUSTOM: $custom_cmd"
          ;;
        *)
          warn "Invalid choice. Step addition cancelled."
          echo ""
          continue
          ;;
      esac
      
      new_steps=()
      for ((i=0; i<real_idx; i++)); do
        new_steps+=("${steps[$i]}")
      done
      new_steps+=("$new_step")
      for ((i=real_idx; i<N; i++)); do
        new_steps+=("${steps[$i]}")
      done
      
      steps=("${new_steps[@]}")
      log "Step successfully added to position $((real_idx + 1))."
      echo ""
    elif [[ "$response" =~ ^([0-9]+)[[:space:]]+([0-9]+)$ ]]; then
      idx1=$(echo "$response" | awk '{print $1}')
      idx2=$(echo "$response" | awk '{print $2}')
      
      real_idx1=$((idx1 - 1))
      real_idx2=$((idx2 - 1))
      
      if [ $real_idx1 -ge 0 ] && [ $real_idx1 -lt ${#steps[@]} ] && \
         [ $real_idx2 -ge 0 ] && [ $real_idx2 -lt ${#steps[@]} ]; then
         
        temp="${steps[$real_idx1]}"
        steps[$real_idx1]="${steps[$real_idx2]}"
        steps[$real_idx2]="$temp"
        
        log "Ordering updated: Step $idx1 and Step $idx2 swapped positions."
        echo ""
      else
        warn "Invalid step numbers!"
        echo ""
      fi
    else
      warn "Invalid format! Type 'y' to continue, 'N' to cancel, 'n' to toggle no-lag, '2 3' to swap, '3 del' to delete, or '2 new' to add."
      echo ""
    fi
  done
fi

# --- RUNNING OPERATIONS ---
log "Starting operations in order..."

for step in "${steps[@]}"; do
  if [[ "$step" =~ ^BUILD: ]]; then
    log "-> Running Step: Build"
    
    final_build_cmd=("./mach" "build")
    if [ ${#build_sub_args[@]} -gt 0 ]; then
      final_build_cmd+=("${build_sub_args[@]}")
    fi
    if [ $no_lag_active -eq 1 ]; then
      cpu=$(grep -c ^processor /proc/cpuinfo)
      process=$(( cpu * 75 / 100 ))
      [ $process -lt 1 ] && process=1
      final_build_cmd+=("-j${process}")
    fi
    
    log "Building ($HILAL_FIREFOX_SRC): ${final_build_cmd[*]}"
    log "(Initial full build may take 10-40 minutes depending on your system)"
    (cd "$HILAL_FIREFOX_SRC" && "${final_build_cmd[@]}")
    
  elif [[ "$step" =~ ^RUN: ]]; then
    log "-> Running Step: Run"
    log "Launching Hilal Browser..."
    (cd "$HILAL_FIREFOX_SRC" && ./mach run)
    
  elif [[ "$step" =~ ^CLI: ]]; then
    log "-> Running Step: CLI"
    log "Opening Hilal Browser CLI console..."
    
    final_cli_cmd=("./mach" "cli")
    if [ ${#cli_sub_args[@]} -gt 0 ]; then
      final_cli_cmd+=("${cli_sub_args[*]:-}")
    fi
    (cd "$HILAL_FIREFOX_SRC" && "${final_cli_cmd[@]}")

  elif [[ "$step" =~ ^PACKAGE: ]]; then
    log "-> Running Step: Package"
    log "Packaging Hilal Browser..."
    (cd "$HILAL_FIREFOX_SRC" && ./mach package)
    
    # --- .packages Directory and config.yml Management ---
    PACKAGES_DIR=".packages"
    CONFIG_YML="config.yml"
    
    mkdir -p "$PACKAGES_DIR"
    
    if [ ! -f "$CONFIG_YML" ]; then
      log "config.yml not found. Creating a new one, build count: 0"
      echo "build_count: 0" > "$CONFIG_YML"
      CURRENT_BUILD=0
    else
      CURRENT_BUILD=$(grep -E '^build_count:' "$CONFIG_YML" | awk '{print $2}')
      if [[ ! "$CURRENT_BUILD" =~ ^[0-9]+$ ]]; then
        CURRENT_BUILD=0
      fi
    fi
    
    NEXT_BUILD=$((CURRENT_BUILD + 1))
    
    TARGET_BUILD_DIR="$PACKAGES_DIR/build_$NEXT_BUILD"
    mkdir -p "$TARGET_BUILD_DIR"
    
    sed -i "s/^build_count:.*/build_count: $NEXT_BUILD/" "$CONFIG_YML"
    
    log "Build count updated: $NEXT_BUILD"
    echo "RESULT_PATH:$TARGET_BUILD_DIR"

  elif [[ "$step" =~ ^FLATPAK-BUILD: ]]; then
    log "-> Running Step: Flatpak Build"
    log "Executing Flatpak-auto build pipeline..."
    bash "$HILAL_REPO_ROOT/scripts/build-flatpak.sh" build

  elif [[ "$step" =~ ^FLATPAK-INSTALL: ]]; then
    log "-> Running Step: Flatpak Install"
    log "Executing Flatpak-auto user installation pipeline..."
    bash "$HILAL_REPO_ROOT/scripts/build-flatpak.sh" install

  elif [[ "$step" =~ ^APPIMAGE-BUILD: ]]; then
    log "-> Running Step: AppImage Build"
    log "Executing AppImage build pipeline..."
    bash "$HILAL_REPO_ROOT/scripts/build-appimage.sh" build

  elif [[ "$step" =~ ^APPIMAGE-RUN: ]]; then
    log "-> Running Step: AppImage Run"
    log "Executing AppImage run pipeline..."
    bash "$HILAL_REPO_ROOT/scripts/build-appimage.sh" run
    
  elif [[ "$step" =~ ^CUSTOM:[[:space:]]*(.*) ]]; then
    custom_cmd="${BASH_REMATCH[1]}"
    log "-> Running Custom Step: $custom_cmd"
    eval "$custom_cmd"
  fi
done

log "Done."