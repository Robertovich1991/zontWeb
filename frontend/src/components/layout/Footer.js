import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Phone } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();
  
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
            <h3 className="text-base font-semibold mb-3 text-gray-300">Nos Services</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/vtc-7-places" className="text-gray-400 hover:text-white transition-colors" data-testid="footer-vtc-7">VTC 7 Places</Link></li>
              <li><Link to="/vtc-8-places" className="text-gray-400 hover:text-white transition-colors" data-testid="footer-vtc-8">VTC 8 Places</Link></li>
              <li><Link to="/become-client" className="text-gray-400 hover:text-white transition-colors">{t('nav.becomeClient')}</Link></li>
              <li><Link to="/countries" className="text-gray-400 hover:text-white transition-colors">{t('nav.countries')}</Link></li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-base font-semibold mb-3 text-gray-300">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/about" className="text-gray-400 hover:text-white transition-colors">
                  {t('footer.aboutUs')}
                </a>
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
            <h3 className="text-base font-semibold mb-3 text-gray-300">Contact</h3>
            <div className="space-y-3 mb-4">
              <a
                href="https://wa.me/33783777027"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#25D366] hover:text-[#20bd5a] transition-colors text-sm font-medium"
                data-testid="footer-whatsapp"
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp
              </a>
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
