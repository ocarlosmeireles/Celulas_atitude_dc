import React, { useMemo } from 'react';

const DEVOTIONALS = [
  {
    text: "Confie no Senhor de todo o seu coração e não se apoie em seu próprio entendimento; reconheça o Senhor em todos os seus caminhos, e ele endireitará as suas veredas.",
    verse: "Provérbios 3:5-6 (NVI)"
  },
  {
    text: "O Senhor é o meu pastor; de nada terei falta. Em verdes pastagens me faz repousar e me conduz a águas tranquilas; refrigera a minha alma.",
    verse: "Salmos 23:1-3 (NVI)"
  },
  {
    text: "Porque Deus tanto amou o mundo que deu o seu Filho Unigênito, para que todo o que nele crer não pereça, mas tenha a vida eterna.",
    verse: "João 3:16 (NVI)"
  },
  {
    text: "Tudo posso naquele que me fortalece. E o meu Deus, segundo as suas riquezas, suprirá todas as vossas necessidades em glória, por Cristo Jesus.",
    verse: "Filipenses 4:13, 19 (NVI)"
  },
  {
    text: "Venham a mim, todos os que estão cansados e sobrecarregados, e eu lhes darei descanso. Tomem sobre vocês o meu jugo e aprendam de mim, pois sou manso e humilde de coração, e vocês encontrarão descanso para as suas almas.",
    verse: "Mateus 11:28-29 (NVI)"
  },
   {
    text: "O amor é paciente, o amor é bondoso. Não inveja, não se vangloria, não se orgulha. Não maltrata, não procura seus interesses, não se ira facilmente, não guarda rancor.",
    verse: "1 Coríntios 13:4-5 (NVI)"
  }
];

const Devotional: React.FC = () => {
  const devotional = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * DEVOTIONALS.length);
    return DEVOTIONALS[randomIndex];
  }, []);

  return (
    <section className="bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-800 dark:to-blue-600 text-white p-6 rounded-xl shadow-lg mb-8 text-center">
      <h2 className="text-2xl font-bold mb-3">Palavra do Dia</h2>
      <p className="italic text-lg mb-4">"{devotional.text}"</p>
      <p className="font-semibold text-blue-100 dark:text-blue-200">{devotional.verse}</p>
    </section>
  );
};

export default Devotional;