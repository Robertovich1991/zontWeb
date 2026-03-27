import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/SEO';
import { useLanguage } from '@/context/LanguageContext';

const content = {
  en: {
    seoTitle: 'Looking for Partners - Drive with Zont',
    seoDesc: 'Zont needs partners like you. Join our network of professional drivers. Quick signup. Start earning with airport transfers across Europe.',
    heroTitle: 'Looking for Partners',
    heroSub: 'We are always looking for reliable drivers to join our growing network. Apply today and start earning.',
    ctaTitle: 'Want to become a partner driver?',
    ctaBtn: 'Apply Now',
    points: [
      'Competitive earnings per transfer',
      'Flexible schedule — work when you want',
      'Growing network across 16 cities',
      'Professional support and training',
    ],
  },
  fr: {
    seoTitle: 'Recherche de Partenaires - Conduisez avec Zont',
    seoDesc: 'Zont a besoin de partenaires comme vous. Rejoignez notre reseau de chauffeurs professionnels. Inscription rapide. Commencez a gagner avec les transferts aeroport.',
    heroTitle: 'Recherche de Partenaires',
    heroSub: 'Nous recherchons en permanence des chauffeurs fiables pour rejoindre notre reseau en pleine croissance. Postulez aujourd\'hui et commencez a gagner.',
    ctaTitle: 'Vous souhaitez devenir chauffeur partenaire ?',
    ctaBtn: 'Postuler Maintenant',
    points: [
      'Revenus competitifs par transfert',
      'Horaires flexibles — travaillez quand vous voulez',
      'Reseau en croissance dans plus de 120 villes',
      'Support professionnel et formation',
    ],
  },
  ru: {
    seoTitle: 'Ищем Партнеров - Работайте с Zont',
    seoDesc: 'Zont ищет партнеров. Присоединяйтесь к нашей сети профессиональных водителей. Быстрая регистрация. Начните зарабатывать на трансферах.',
    heroTitle: 'Ищем Партнеров',
    heroSub: 'Мы всегда ищем надежных водителей для нашей растущей сети. Подайте заявку сегодня и начните зарабатывать.',
    ctaTitle: 'Хотите стать партнером-водителем?',
    ctaBtn: 'Подать Заявку',
    points: [
      'Конкурентный заработок за трансфер',
      'Гибкий график — работайте когда хотите',
      'Растущая сеть в 16 городах',
      'Профессиональная поддержка и обучение',
    ],
  },
  hy: {
    seoTitle: 'Փնտրում Ենք Գործընկերներ - Վարեք Zont-ի Հետ',
    seoDesc: 'Zont-ին պետք են ձեզ նման գործընկերներ: Միացեք պրոֆեսիոնալ վարորդների մեր ցանցին:',
    heroTitle: 'Փնտրում Ենք Գորցընկերներ',
    heroSub: 'Մենք միշտ փնտրում ենք հուսալի վարորդների մեր աճկող ցանցին միանալու համար: Դիմեք այսօր և սկսեք վաստակել:',
    ctaTitle: 'Ուզուվ \u0565ք դառնալ գործընկեր-վարորդ՞',
    ctaBtn: 'Դիմեք Հիմա',
    points: [
      'Մրցունակ վաստակ յուրաքանչյուր տրանսֆերի համար',
      'Ճկուն գրաֆիկ — աշխատեք երբ ուզում եք',
      'Աճկող ցանց 16 քաղաքներում',
      'Պրոֆեսիոնալ աջակցություն և վերապատրաստում',
    ],
  },
};

const LookingForPartners = () => {
  const { language } = useLanguage();
  const c = content[language] || content.en;
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-[#1a2332]" data-testid="looking-for-partners-page">
      <SEO title={c.seoTitle} description={c.seoDesc} canonical="https://www.zont.cab/looking-for-partners" />
      <Header />

      <section className="pt-32 pb-12 px-4 bg-gradient-to-br from-[#2ecc71] to-[#27ae60] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6" data-testid="partners-search-h1">{c.heroTitle}</h1>
          <p className="text-lg sm:text-xl max-w-2xl mx-auto">{c.heroSub}</p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <ul className="space-y-4">
            {c.points.map((point, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-300 text-lg">
                <span className="text-[#2ecc71] font-bold mt-0.5">&#10003;</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-6">{c.ctaTitle}</h2>
          <button
            onClick={() => navigate('/become-driver')}
            className="px-10 py-4 bg-[#2ecc71] text-white font-bold rounded-lg hover:bg-[#27ae60] transition-colors text-lg"
            data-testid="apply-btn"
          >
            {c.ctaBtn}
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LookingForPartners;
