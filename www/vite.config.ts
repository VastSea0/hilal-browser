import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { execSync } from 'node:child_process';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';

function liveContributorsPlugin(): Plugin {
  const repoRoot = path.resolve(__dirname, '..');
  return {
    name: 'hilal-live-contributors',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.split('?')[0] !== '/api/contributors') {
          next();
          return;
        }
        try {
          const rawAuthors = execSync('git log --pretty=format:"%an%x09%ae"', {
            cwd: repoRoot,
            encoding: 'utf8',
          })
            .trim()
            .split('\n')
            .filter(Boolean);

          const counts: Record<
            string,
            {
              username: string;
              name: string;
              avatarUrl: string;
              githubUrl: string;
              contributions: number;
              role: string;
            }
          > = {};

          for (const line of rawAuthors) {
            const [name, email] = line.split('\t');
            const lowerEmail = (email || '').toLowerCase();
            const lowerName = (name || '').toLowerCase();
            let key = name || 'unknown';
            let username = name || 'unknown';
            let cleanName = name || 'unknown';
            let role = 'Contributor';

            if (
              lowerEmail.includes('vastsea') ||
              lowerName.includes('vastsea') ||
              lowerName.includes('egehan')
            ) {
              key = 'VastSea0';
              username = 'VastSea0';
              cleanName = 'Egehan KAHRAMAN';
              role = 'Lead Developer';
            } else if (lowerEmail.includes('greenkod') || lowerName.includes('greenkod')) {
              key = 'greenkod';
              username = 'greenkod';
              cleanName = 'GreenKod';
            } else if (
              lowerEmail.includes('menemensogantutmuyor') ||
              lowerName.includes('ataberk')
            ) {
              key = 'AtaberkCelil';
              username = 'AtaberkCelil';
              cleanName = 'Ataberk Celil';
            } else if (
              lowerEmail.includes('mmapro12') ||
              lowerName.includes('muhammed beshir')
            ) {
              key = 'mmapro12';
              username = 'mmapro12';
              cleanName = 'Muhammed Beshir';
            }

            if (!counts[key]) {
              counts[key] = {
                username,
                name: cleanName,
                avatarUrl: `https://github.com/${username}.png`,
                githubUrl: `https://github.com/${username}`,
                contributions: 0,
                role,
              };
            }
            counts[key].contributions += 1;
          }

          const list = Object.values(counts).sort(
            (a, b) => b.contributions - a.contributions
          );
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.setHeader('Cache-Control', 'no-store');
          res.end(JSON.stringify(list));
        } catch (err) {
          next(err);
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), liveContributorsPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
