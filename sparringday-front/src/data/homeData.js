import { Flame, Medal, Users } from 'lucide-react';

export const navItems = ['Home', 'Lutas', 'Rankings', 'Eventos', 'Sobre', 'Contato'];

export const rankings = {
  masculino: [
    { pos: '#1', name: 'Carlos Nocaute', record: '18V • 2D', category: 'Peso Médio' },
    { pos: '#2', name: 'Diego Relâmpago', record: '14V • 3D', category: 'Peso Leve' },
    { pos: '#3', name: 'Rafael Punho', record: '12V • 1D', category: 'Peso Pena' },
  ],
  feminino: [
    { pos: '#1', name: 'Amanda Falcão', record: '16V • 1D', category: 'Peso Palha' },
    { pos: '#2', name: 'Bianca Tempestade', record: '13V • 2D', category: 'Peso Mosca' },
    { pos: '#3', name: 'Júlia Impacto', record: '11V • 4D', category: 'Peso Galo' },
  ],
};

export const highlights = [
  {
    icon: Flame,
    title: 'Lutas em destaque',
    text: 'Acompanhe os confrontos mais aguardados, com histórico dos atletas, cards completos e resultados atualizados.',
  },
  {
    icon: Medal,
    title: 'Ranking por categoria',
    text: 'Veja quem está no topo em cada divisão e acompanhe a evolução dos atletas ao longo dos eventos.',
  },
  {
    icon: Users,
    title: 'Portal dos atletas',
    text: 'Perfis, vídeos, cartel, eventos e informações centralizadas para fortalecer a cena nacional de lutas.',
  },
];

export const news = [
  'SparringDay anuncia novo card com atletas promissores do cenário nacional',
  'Ranking atualizado após noite de grandes confrontos no peso leve',
  'Evento especial terá transmissão, pesagem aberta e cobertura completa',
];
