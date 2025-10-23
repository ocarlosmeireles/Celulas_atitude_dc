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
    // Show a new verse each day of the year
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    return DEVOTIONALS[dayOfYear % DEVOTIONALS.length];
  }, []);

  return (
    <section className="bg-gradient-to-br from-brand-primary-light to-purple-600 dark:from-brand-primary-dark dark:to-purple-800 text-white p-6 sm:p-8 rounded-2xl shadow-xl mb-10 relative overflow-hidden text-center">
       <div className="absolute -top-10 -right-10 w-32 h-32 text-white/10">
          <i className="fas fa-cross text-9xl transform rotate-12"></i>
       </div>
      <h2 className="text-2xl font-serif font-bold mb-3 relative z-10">Palavra do Dia</h2>
      <p className="italic text-lg mb-4 opacity-90 max-w-3xl mx-auto relative z-10">"{devotional.text}"</p>
      <p className="font-semibold text-white/80 relative z-10">{devotional.verse}</p>
    </section>
  );
};

export default Devotional;