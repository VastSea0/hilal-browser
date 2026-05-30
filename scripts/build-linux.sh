#!/usr/bin/env bash
# scripts/build-linux.sh
#
# Convenience wrapper around `./mach build` and `./mach package` for Hilal on Linux.
#
# Usage:
#   scripts/build-linux.sh                 # Default: full build (if no specific flags passed)
#   scripts/build-linux.sh build           # Explicit full build
#   scripts/build-linux.sh faster          # Front-end only build
#   scripts/build-linux.sh binaries        # C++/Rust only build
#   scripts/build-linux.sh no-lag          # Build using only 75% of CPU cores
#   scripts/build-linux.sh run             # Build and run
#   scripts/build-linux.sh package         # Package only (or package after build if build requested)
#   scripts/build-linux.sh cli             # Launch Hilal CLI command line

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
    cli)
      cli_active=1
      last_defined_arg="cli"
      shift
      ;;
    *)
      # If an unknown parameter comes immediately after a defined one, group them together
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
        # If there is no prior defined parameter, save as independent unknown parameter
        unknown_params+=("$1")
        # Default to build if an undefined parameter is passed with no other actions
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
  # No-lag check is included in the build command
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
  steps+=("PACKAGE: ./mach package & copying operations")
fi

# Exit if no actions are scheduled
if [ ${#steps[@]} -eq 0 ]; then
  log "No execution steps scheduled."
  exit 0
fi

# --- INTERACTIVE ORDERING AND APPROVAL MECHANISM ---
# Only prompted for interactive terminals
if [ -t 0 ]; then
  while true; do
    echo "=================================================="
    log "EXECUTION STEP ORDER:"
    echo "=================================================="
    for i in "${!steps[@]}"; do
      echo "  $((i+1)) -> ${steps[$i]}"
    done
    echo "=================================================="
    
    # Show warning if there are unknown parameters
    if [ ${#unknown_params[@]} -gt 0 ]; then
      warn "Warning: Undefined parameters detected and included in processing: ${unknown_params[*]}"
    fi
    
    echo "Options:"
    echo "  [y/Confirm]   : Approve this order and start operations."
    echo "  [N/Cancel]    : Exit."
    echo "  [Num Num]     : Swap the positions of two steps (e.g., '2 3' to swap steps 2 and 3)."
    echo "  [Num del]     : Delete a step from the list (e.g., '3 del' to remove step 3)."
    echo "  [Num new]     : Insert/add a new step at a specific position (e.g., '2 new')."
    echo "--------------------------------------------------"
    read -rp "Your selection: " response
    echo ""
    
    # Input cleaning and exit checks
    if [[ "$response" =~ ^[Nn]$ ]] || [ "$response" = "exit" ]; then
      log "Operation cancelled by user."
      exit 1
    elif [[ "$response" =~ ^[Yy]$ ]] || [ -z "$response" ]; then
      # User confirmed, exit loop and run processes
      break
    elif [[ "$response" =~ ^([0-9]+)[[:space:]]+(del|delete)$ ]]; then
      idx=$(echo "$response" | awk '{print $1}')
      real_idx=$((idx - 1))
      
      # Bound check for deletion
      if [ $real_idx -ge 0 ] && [ $real_idx -lt ${#steps[@]} ]; then
        # Reconstruct the array without the deleted element
        new_steps=()
        for i in "${!steps[@]}"; do
          if [ "$i" -ne "$real_idx" ]; then
            new_steps+=("${steps[$i]}")
          fi
        done
        steps=("${new_steps[@]}")
        
        log "Step $idx has been removed."
        echo ""
        
        # Exit gracefully if no steps are left
        if [ ${#steps[@]} -eq 0 ]; then
          log "No steps left in the list. Exiting."
          exit 0
        fi
      else
        warn "Invalid step number! Please enter a number that exists in the list."
        echo ""
      fi
    elif [[ "$response" =~ ^([0-9]+)[[:space:]]+(new)$ ]]; then
      idx=$(echo "$response" | awk '{print $1}')
      N=${#steps[@]}
      real_idx=$((idx - 1))
      
      # Bound checks and shifting rules
      if [ $real_idx -lt 0 ]; then
        real_idx=0
      fi
      if [ $real_idx -gt "$N" ]; then
        real_idx=$N
      fi
      
      # Prompt user for the type of step to insert
      echo "Select step type to insert (Position: $((real_idx + 1))):"
      echo "  1) BUILD (Full Build / mach build)"
      echo "  2) RUN (Run Hilal / mach run)"
      echo "  3) PACKAGE (Package Hilal / mach package)"
      echo "  4) CUSTOM COMMAND (Run any custom bash command)"
      read -rp "Your choice (1-4): " choice
      echo ""
      
      new_step=""
      case "$choice" in
        1)
          new_step="BUILD: ./mach build"
          build_active=1
          ;;
        2)
          new_step="RUN: ./mach run"
          run_after=1
          ;;
        3)
          new_step="PACKAGE: ./mach package & copying operations"
          package_after=1
          ;;
        4)
          read -rp "Enter the custom shell command to run: " custom_cmd
          new_step="CUSTOM: $custom_cmd"
          ;;
        *)
          warn "Invalid choice. Step insertion cancelled."
          echo ""
          continue
          ;;
      esac
      
      # Create new shifted steps list
      new_steps=()
      for ((i=0; i<real_idx; i++)); do
        new_steps+=("${steps[$i]}")
      done
      new_steps+=("$new_step")
      for ((i=real_idx; i<N; i++)); do
        new_steps+=("${steps[$i]}")
      done
      
      steps=("${new_steps[@]}")
      log "Step successfully inserted at position $((real_idx + 1))."
      echo ""
    elif [[ "$response" =~ ^([0-9]+)[[:space:]]+([0-9]+)$ ]]; then
      idx1=$(echo "$response" | awk '{print $1}')
      idx2=$(echo "$response" | awk '{print $2}')
      
      # Convert 1-based indices to 0-based array indices
      real_idx1=$((idx1 - 1))
      real_idx2=$((idx2 - 1))
      
      # Bound check for swap
      if [ $real_idx1 -ge 0 ] && [ $real_idx1 -lt ${#steps[@]} ] && \
         [ $real_idx2 -ge 0 ] && [ $real_idx2 -lt ${#steps[@]} ]; then
         
        # Swap operation
        temp="${steps[$real_idx1]}"
        steps[$real_idx1]="${steps[$real_idx2]}"
        steps[$real_idx2]="$temp"
        
        log "Order updated: Step $idx1 and Step $idx2 swapped."
        echo ""
      else
        warn "Invalid step numbers! Please enter numbers that exist in the list."
        echo ""
      fi
    else
      warn "Invalid format. Enter 'y' to continue, 'n' to cancel, '2 3' to swap, '3 del' to delete, or '2 new' to insert."
      echo ""
    fi
  done
fi

# --- RUNNING OPERATIONS ---
log "Starting operations in order..."

for step in "${steps[@]}"; do
  if [[ "$step" =~ ^BUILD: ]]; then
    log "-> Running Step: Build"
    
    # Reassembling build command parameters
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
      final_cli_cmd+=("${cli_sub_args[@]}")
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
    
    DIST_SRC="$HILAL_FIREFOX_SRC/obj-x86_64-pc-linux-gnu/dist"
    if [ -d "$DIST_SRC" ]; then
      log "Moving package files: $DIST_SRC -> $TARGET_BUILD_DIR"
      cp -r "$DIST_SRC"/* "$TARGET_BUILD_DIR/"
    else
      warn "Build output ($DIST_SRC) not found! Packaging step might be skipped."
    fi
    
    sed -i "s/^build_count:.*/build_count: $NEXT_BUILD/" "$CONFIG_YML"
    
    log "Build count updated: $NEXT_BUILD"
    
    # Standard output for calling automation scripts to parse:
    echo "RESULT_PATH:$TARGET_BUILD_DIR"
    
  elif [[ "$step" =~ ^CUSTOM:[[:space:]]*(.*) ]]; then
    custom_cmd="${BASH_REMATCH[1]}"
    log "-> Running Custom Step: $custom_cmd"
    eval "$custom_cmd"
  fi
done

log "Done."