import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Phone } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const Footer = () => {
  const { t, language } = useLanguage();
  
  return (
    <footer className="bg-[#0f1419] text-white border-t border-gray-800" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1">
            <div className="text-2xl font-bold text-white mb-4">ZONT</div>
            <p className="text-gray-400 text-sm">
              {t('footer.description')}
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-base font-semibold mb-3 text-gray-300">{language === 'en' ? 'Our Services' : language === 'ru' ? 'Наши услуги' : language === 'hy' ? 'Մեր ծառայությունները' : language === 'es' ? 'Nuestros servicios' : 'Nos Services'}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to={language === 'en' ? '/driver-at-disposal' : language === 'ru' ? '/voditel-s-avtomobilem' : language === 'hy' ? '/varorde-tramadrutyamb' : language === 'es' ? '/es/chofer-privado-a-disposicion' : '/chauffeur-mis-a-disposition'} className="text-[#c8a951] hover:text-[#d4b85c] transition-colors font-medium" data-testid="footer-driver-at-disposal">{language === 'en' ? 'Driver at Disposal' : language === 'ru' ? 'Водитель в распоряжение' : language === 'hy' ? 'Վարորդ տրամադրությամբ' : language === 'es' ? 'Chófer a disposición' : 'Chauffeur mis à disposition'}</Link></li>
              <li><Link to={language === 'en' ? '/vtc-7-seats' : language === 'ru' ? '/vtc-7-mest' : language === 'hy' ? '/vtc-7-tegh' : language === 'es' ? '/es/minivan-traslado-aeropuerto-paris' : '/vtc-7-places'} className="text-gray-400 hover:text-white transition-colors" data-testid="footer-vtc-7">{language === 'en' ? 'Minivan 7 Seats' : language === 'ru' ? 'Минивэн 7 Мест' : language === 'es' ? 'Minivan 7 plazas' : 'VTC 7 Places'}</Link></li>
              <li><Link to={language === 'en' ? '/vtc-8-seats' : language === 'ru' ? '/vtc-8-mest' : language === 'hy' ? '/vtc-8-tegh' : '/vtc-8-places'} className="text-gray-400 hover:text-white transition-colors" data-testid="footer-vtc-8">{language === 'en' ? 'Minibus 8 Seats' : language === 'ru' ? 'Минибус 8 Мест' : language === 'es' ? 'Minibús 8 plazas' : 'VTC 8 Places'}</Link></li>
              <li><Link to={language === 'es' ? '/es/hazte-cliente' : '/become-client'} className="text-gray-400 hover:text-white transition-colors">{t('nav.becomeClient')}</Link></li>
              <li><Link to="/countries" className="text-gray-400 hover:text-white transition-colors">{t('nav.countries')}</Link></li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-base font-semibold mb-3 text-gray-300">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors">
                  {t('footer.aboutUs')}
                </Link>
              </li>
              <li>
                <Link to="/become-driver" className="text-gray-400 hover:text-white transition-colors" data-testid="footer-become-driver">
                  {t('nav.becomeDriver')}
                </Link>
              </li>
              <li>
                <a href="/terms" className="text-gray-400 hover:text-white transition-colors">
                  {t('footer.terms')}
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  {t('footer.privacy')}
                </a>
              </li>
            </ul>
          </div>

          {/* Social + Contact */}
          <div>
            <h3 className="text-base font-semibold mb-3 text-gray-300">{language === 'en' ? 'Contact' : language === 'ru' ? 'Контакты' : language === 'hy' ? 'Կապ' : language === 'es' ? 'Contacto' : 'Contact'}</h3>
            <div className="mb-4">
              <a href="tel:+33783777027" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm" data-testid="footer-phone">
                <Phone size={16} className="flex-shrink-0" />
                +33 7 83 77 70 27
              </a>
            </div>
            <h3 className="text-base font-semibold mb-3 text-gray-300">{t('footer.followUs')}</h3>
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com/Zontcab-390761701681460/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://www.instagram.com/zont.cab/?hl=en"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-6 pt-6 text-center text-gray-400 text-sm">
          <p>{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
