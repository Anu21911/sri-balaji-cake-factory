const fs = require('fs');
const path = require('path');
const https = require('https');

const dir = path.join(__dirname, '..', '..', 'public', 'images', 'products');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const images = [
  {
    name: 'pineapple-cake.jpg',
    url: 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'butterscotch-cake.jpg',
    url: 'https://images.unsplash.com/photo-1562440499-64c9a111f713?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'chocolate-cake.jpg',
    url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'vanilla-cake.jpg',
    url: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'rasmalai-cake.jpg',
    url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'sparkles.jpg',
    url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'snow-spray.jpg',
    url: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'paper-shots.jpg',
    url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'shalvas.jpg',
    url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'gun-coils.jpg',
    url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'fallback.jpg',
    url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80'
  }
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return download(response.headers.location, dest).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve(dest));
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function run() {
  for (const item of images) {
    const dest = path.join(dir, item.name);
    try {
      console.log(`Downloading ${item.name}...`);
      await download(item.url, dest);
      console.log(`Saved ${item.name}`);
    } catch (err) {
      console.warn(`Could not download ${item.name}: ${err.message}`);
    }
  }
  console.log('Finished downloading authentic product images.');
}

run();
