import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SKET-OK Skateboard Shop & Map',
    short_name: 'SKET-OK',
    description: 'Sklep deskorolkowy, kreator 3D customowych desek oraz mapa spotów deskorolkowych.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0F1820',
    theme_color: '#7B72B5',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
