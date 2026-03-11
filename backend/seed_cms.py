"""
Seed script to populate CMS with real site data.
Run: python seed_cms.py
"""
import asyncio
import os
import uuid
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).parent / '.env')

mongo_url = os.environ['MONGO_URL']
db_name = os.environ['DB_NAME']

async def seed():
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    now = datetime.now(timezone.utc).isoformat()

    # Clear existing CMS data
    await db.cms_pages.delete_many({})
    await db.cms_places.delete_many({})
    await db.cms_trust_blocks.delete_many({})
    await db.cms_faqs.delete_many({})
    await db.cms_homepage.delete_many({})
    print("Cleared existing CMS data.")

    # ========== PAGES ==========
    pages = [
        {
            "internal_name": "Transfert Aeroport Paris (CDG, Orly, Beauvais)",
            "page_type": "airport",
            "slug": {"fr": "/transfert-aeroport-paris", "en": "/paris-airport-transfer", "ru": "/taksi-iz-aeroporta-parij", "hy": ""},
            "seo": {
                "title": {"fr": "Transfert Aeroport Paris - CDG, Orly et Beauvais | Zont", "en": "Paris Airport Transfer - CDG, Orly & Beauvais | Zont", "ru": "Трансфер из Аэропорта Парижа - CDG, Орли, Бове | Zont", "hy": ""},
                "meta_description": {"fr": "Service de chauffeur prive premium depuis tous les aeroports parisiens. Prix fixes, suivi de vol, accueil personnalise.", "en": "Professional private driver from all Paris airports. Fixed prices, flight tracking, meet and greet.", "ru": "Профессиональный водитель из аэропортов Парижа. Фиксированные цены, отслеживание рейсов.", "hy": ""},
                "h1": {"fr": "Transfert Aeroport Paris - CDG, Orly et Beauvais", "en": "Paris Airport Transfer - CDG, Orly & Beauvais", "ru": "Трансфер из Аэропорта Парижа - CDG, Орли и Бове", "hy": ""},
                "h2": {"fr": "Service de chauffeur prive depuis tous les aeroports parisiens vers le centre-ville", "en": "Professional private driver from all Paris airports to city center", "ru": "Премиум трансфер из всех аэропортов Парижа в центр города", "hy": ""},
                "canonical": "/transfert-aeroport-paris", "noindex": False, "og_title": {}, "og_description": {}, "og_image": ""
            },
            "intro": {"fr": "Reservez votre transfert aeroport Paris avec des chauffeurs professionnels francophones. Nous proposons un transport premium depuis Charles de Gaulle (CDG), Orly et Beauvais vers Paris et toute la region. Prix fixes, suivi de vol, accueil avec pancarte nominative.", "en": "Book your reliable Paris airport transfer with professional English-speaking drivers. Premium transportation from CDG, Orly and Beauvais airports to anywhere in Paris.", "ru": "Забронируйте трансфер из аэропорта Парижа с профессиональными русскоговорящими водителями. Премиум-транспорт из CDG, Орли и Бове.", "hy": ""},
            "main_content": {"fr": "Paris accueille plus de 100 millions de visiteurs par an dans ses trois aeroports. Evitez les longues files de taxis et les RER bondes. Nos chauffeurs professionnels suivent votre vol en temps reel.", "en": "Paris welcomes over 100 million visitors per year across its three airports. Skip the long taxi queues and confusing RER trains.", "ru": "Париж принимает более 100 миллионов посетителей ежегодно через три аэропорта.", "hy": ""},
            "blocks": [], "faq": [], "cta_text": {}, "hero_image": "", "status": "published", "priority": 1, "related_pages": []
        },
        {
            "internal_name": "Transfert Aeroport CDG - Charles de Gaulle",
            "page_type": "airport",
            "slug": {"fr": "/transfert-aeroport-cdg", "en": "/cdg-airport-transfer", "ru": "/taksi-iz-aeroporta-cdg", "hy": ""},
            "seo": {
                "title": {"fr": "Transfert Aeroport CDG - Charles de Gaulle Voiture Privee | Zont", "en": "CDG Airport Transfer - Charles de Gaulle Private Car | Zont", "ru": "Трансфер из Аэропорта CDG - Шарль де Голль | Zont", "hy": ""},
                "meta_description": {"fr": "Chauffeur prive premium depuis l'aeroport Paris Charles de Gaulle vers Paris centre, hotels et toutes destinations. Prix fixes.", "en": "Premium private driver from Paris Charles de Gaulle Airport to Paris city center, hotels and all destinations.", "ru": "Премиум трансфер из аэропорта Шарль де Голль в центр Парижа, отели и все направления.", "hy": ""},
                "h1": {"fr": "Transfert Aeroport CDG - Charles de Gaulle Voiture Privee", "en": "CDG Airport Transfer - Charles de Gaulle Private Car", "ru": "Трансфер из Аэропорта CDG - Шарль де Голль Частный Автомобиль", "hy": ""},
                "h2": {"fr": "Chauffeur prive premium depuis l'aeroport Paris CDG", "en": "Premium private driver from Paris CDG Airport", "ru": "Премиум трансфер из аэропорта CDG", "hy": ""},
                "canonical": "/transfert-aeroport-cdg", "noindex": False, "og_title": {}, "og_description": {}, "og_image": ""
            },
            "intro": {"fr": "Reservez votre transfert aeroport CDG avec des chauffeurs professionnels. L'aeroport Paris Charles de Gaulle est le plus grand aeroport de France, situe a 25 km au nord-est de Paris. Transferts prives premium depuis tous les terminaux.", "en": "Book your CDG airport transfer with professional drivers. Paris CDG is France's largest airport, 25 km northeast of Paris.", "ru": "Забронируйте трансфер из аэропорта CDG с профессиональными водителями. Аэропорт Шарль де Голль - крупнейший аэропорт Франции.", "hy": ""},
            "main_content": {"fr": "L'aeroport CDG accueille plus de 70 millions de passagers par an. Evitez les longues files de taxis et les RER bondes.", "en": "CDG handles over 70 million passengers annually. Skip the long taxi queues and crowded RER trains.", "ru": "Аэропорт CDG обслуживает более 70 миллионов пассажиров ежегодно.", "hy": ""},
            "blocks": [], "faq": [], "cta_text": {}, "hero_image": "", "status": "published", "priority": 2, "related_pages": []
        },
        {
            "internal_name": "Transfert Aeroport Orly",
            "page_type": "airport",
            "slug": {"fr": "/transfert-aeroport-orly", "en": "/orly-airport-transfer", "ru": "/taksi-iz-aeroporta-orli", "hy": ""},
            "seo": {
                "title": {"fr": "Transfert Aeroport Orly - Voiture Privee | Zont", "en": "Orly Airport Transfer - Private Car Service | Zont", "ru": "Трансфер из Аэропорта Орли | Zont", "hy": ""},
                "meta_description": {"fr": "Chauffeur prive premium depuis l'aeroport Paris-Orly vers Paris centre. Prix fixes, suivi de vol.", "en": "Premium private driver from Paris Orly Airport to Paris city center. Fixed prices, flight tracking.", "ru": "Премиум трансфер из аэропорта Париж-Орли в центр Парижа.", "hy": ""},
                "h1": {"fr": "Transfert Aeroport Orly - Voiture Privee", "en": "Orly Airport Transfer - Private Car Service", "ru": "Трансфер из Аэропорта Орли - Частный Автомобиль", "hy": ""},
                "h2": {"fr": "Chauffeur prive depuis l'aeroport Paris-Orly", "en": "Premium private driver from Paris Orly Airport", "ru": "Премиум трансфер из аэропорта Орли", "hy": ""},
                "canonical": "/transfert-aeroport-orly", "noindex": False, "og_title": {}, "og_description": {}, "og_image": ""
            },
            "intro": {"fr": "L'aeroport Paris-Orly (ORY) est le deuxieme aeroport de la region parisienne, situe a 13 km au sud du centre-ville. Transferts prives premium depuis les Terminaux 1-4.", "en": "Paris Orly Airport (ORY) is the second largest airport in the Paris region, located just 13 km south of the city center.", "ru": "Аэропорт Париж-Орли (ORY) - второй по величине аэропорт в парижском регионе, 13 км к югу от центра.", "hy": ""},
            "main_content": {}, "blocks": [], "faq": [], "cta_text": {}, "hero_image": "", "status": "published", "priority": 3, "related_pages": []
        },
        {
            "internal_name": "Transfert Aeroport Beauvais",
            "page_type": "airport",
            "slug": {"fr": "/transfert-aeroport-beauvais", "en": "/beauvais-airport-transfer", "ru": "/taksi-iz-aeroporta-bove", "hy": ""},
            "seo": {
                "title": {"fr": "Transfert Aeroport Beauvais - Voiture Privee vers Paris | Zont", "en": "Beauvais Airport Transfer - Private Car to Paris | Zont", "ru": "Трансфер из Аэропорта Бове в Париж | Zont", "hy": ""},
                "meta_description": {"fr": "Chauffeur prive depuis l'aeroport Beauvais-Tille vers Paris centre. Prix fixes, 75-90 minutes.", "en": "Professional private driver from Beauvais Airport to Paris city center. Fixed prices.", "ru": "Профессиональный водитель из аэропорта Бове в центр Парижа. Фиксированные цены.", "hy": ""},
                "h1": {"fr": "Transfert Aeroport Beauvais - Voiture Privee vers Paris", "en": "Beauvais Airport Transfer - Private Car to Paris", "ru": "Трансфер из Аэропорта Бове - Частный Автомобиль в Париж", "hy": ""},
                "h2": {}, "canonical": "/transfert-aeroport-beauvais", "noindex": False, "og_title": {}, "og_description": {}, "og_image": ""
            },
            "intro": {"fr": "L'aeroport Beauvais-Tille (BVA) est situe a 85 km au nord de Paris. Hub majeur pour Ryanair et Wizz Air. Transferts prives premium vers Paris.", "en": "Beauvais-Tille Airport (BVA) is located 85 km north of Paris. A major hub for low-cost airlines.", "ru": "Аэропорт Бове-Тийе (BVA) расположен в 85 км к северу от Парижа. Хаб для лоукостеров.", "hy": ""},
            "main_content": {}, "blocks": [], "faq": [], "cta_text": {}, "hero_image": "", "status": "published", "priority": 4, "related_pages": []
        },
        {
            "internal_name": "Transfert Gare de Paris",
            "page_type": "station",
            "slug": {"fr": "/transfert-gare-paris", "en": "/paris-train-station-transfer", "ru": "/transfer-vokzal-parizh", "hy": ""},
            "seo": {
                "title": {"fr": "Transfert Gare de Paris - Voiture Privee avec Chauffeur | Zont", "en": "Paris Train Station Transfer - Private Car Service | Zont", "ru": "Трансфер с Вокзалов Парижа | Zont", "hy": ""},
                "meta_description": {"fr": "Chauffeur prive depuis et vers toutes les gares parisiennes. Gare du Nord, Gare de Lyon, Montparnasse.", "en": "Premium private driver to and from all Paris train stations. Fixed prices.", "ru": "Премиум трансфер со всех вокзалов Парижа.", "hy": ""},
                "h1": {"fr": "Transfert Gare de Paris - Voiture Privee avec Chauffeur", "en": "Paris Train Station Transfer - Private Car Service", "ru": "Трансфер с Вокзалов Парижа - Частный Автомобиль", "hy": ""},
                "h2": {}, "canonical": "/transfert-gare-paris", "noindex": False, "og_title": {}, "og_description": {}, "og_image": ""
            },
            "intro": {"fr": "Chauffeur prive premium depuis et vers toutes les gares parisiennes : Gare du Nord, Gare de Lyon, Gare Montparnasse, Gare de l'Est, Gare Saint-Lazare, Gare d'Austerlitz.", "en": "Premium private driver to and from all Paris train stations.", "ru": "Премиум трансфер со всех вокзалов Парижа.", "hy": ""},
            "main_content": {}, "blocks": [], "faq": [], "cta_text": {}, "hero_image": "", "status": "published", "priority": 5, "related_pages": []
        },
        {
            "internal_name": "Transfert Aeroport Nice - Cote d'Azur",
            "page_type": "city",
            "slug": {"fr": "/transfert-aeroport-nice", "en": "/nice-airport-transfer", "ru": "/taksi-iz-aeroporta-nitstsa", "hy": ""},
            "seo": {
                "title": {"fr": "Transfert Aeroport Nice - Cote d'Azur | Zont", "en": "Nice Airport Transfer - Cote d'Azur Airport | Zont", "ru": "Трансфер из Аэропорта Ниццы | Zont", "hy": ""},
                "meta_description": {"fr": "Service de chauffeur prive depuis l'aeroport de Nice vers votre hotel, le centre-ville ou toute la Cote d'Azur. Prix fixes.", "en": "Private driver service from Nice Cote d'Azur Airport to your hotel or anywhere on the French Riviera.", "ru": "Услуги частного водителя из аэропорта Ниццы. Фиксированные цены.", "hy": ""},
                "h1": {"fr": "Transfert Aeroport Nice - Cote d'Azur", "en": "Nice Airport Transfer - Cote d'Azur Airport", "ru": "Трансфер из Аэропорта Ниццы - Лазурный Берег", "hy": ""},
                "h2": {}, "canonical": "/transfert-aeroport-nice", "noindex": False, "og_title": {}, "og_description": {}, "og_image": ""
            },
            "intro": {"fr": "Reservez votre transfert aeroport Nice avec des chauffeurs professionnels. Nice Cote d'Azur est le troisieme aeroport le plus frequente de France.", "en": "Book your Nice airport transfer with professional drivers. Nice Cote d'Azur is the third busiest airport in France.", "ru": "Забронируйте трансфер из аэропорта Ниццы с профессиональными водителями.", "hy": ""},
            "main_content": {}, "blocks": [], "faq": [], "cta_text": {}, "hero_image": "", "status": "published", "priority": 6, "related_pages": []
        },
        {
            "internal_name": "Transfert Aeroport Monaco",
            "page_type": "city",
            "slug": {"fr": "/transfert-aeroport-monaco", "en": "/monaco-airport-transfer", "ru": "/taksi-iz-aeroporta-monako", "hy": ""},
            "seo": {
                "title": {"fr": "Transfert Aeroport Monaco - Service Voiture Privee | Zont", "en": "Monaco Airport Transfer - Private Car Service | Zont", "ru": "Трансфер в Монако из Аэропорта | Zont", "hy": ""},
                "meta_description": {"fr": "Chauffeur prive premium depuis l'aeroport de Nice vers Monaco, Monte-Carlo. Prix fixes.", "en": "Premium private driver from Nice Airport to Monaco, Monte-Carlo. Fixed prices.", "ru": "Премиум трансфер из аэропорта Ниццы в Монако, Монте-Карло.", "hy": ""},
                "h1": {"fr": "Transfert Aeroport Monaco", "en": "Monaco Airport Transfer", "ru": "Трансфер в Монако из Аэропорта", "hy": ""},
                "h2": {}, "canonical": "/transfert-aeroport-monaco", "noindex": False, "og_title": {}, "og_description": {}, "og_image": ""
            },
            "intro": {"fr": "Monaco ne possede pas d'aeroport propre, le plus proche est l'aeroport Nice Cote d'Azur (NCE), a seulement 30 minutes.", "en": "Monaco does not have its own airport. The closest is Nice Cote d'Azur Airport (NCE), just 30 minutes away.", "ru": "В Монако нет собственного аэропорта, ближайший - Ницца Лазурный Берег (NCE), 30 минут.", "hy": ""},
            "main_content": {}, "blocks": [], "faq": [], "cta_text": {}, "hero_image": "", "status": "published", "priority": 7, "related_pages": []
        },
        {
            "internal_name": "Transfert Aeroport Cannes",
            "page_type": "city",
            "slug": {"fr": "/transfert-aeroport-cannes", "en": "/cannes-airport-transfer", "ru": "/taksi-iz-aeroporta-kanny", "hy": ""},
            "seo": {
                "title": {"fr": "Transfert Aeroport Cannes - Voiture Privee | Zont", "en": "Cannes Airport Transfer - Private Car Service | Zont", "ru": "Трансфер в Канны из Аэропорта | Zont", "hy": ""},
                "meta_description": {"fr": "Chauffeur prive depuis l'aeroport de Nice vers Cannes, La Croisette. Prix fixes.", "en": "Premium private driver from Nice Airport to Cannes, La Croisette.", "ru": "Премиум трансфер из аэропорта Ниццы в Канны, Круазетт.", "hy": ""},
                "h1": {"fr": "Transfert Aeroport Cannes - Voiture Privee", "en": "Cannes Airport Transfer - Private Car Service", "ru": "Трансфер в Канны из Аэропорта", "hy": ""},
                "h2": {}, "canonical": "/transfert-aeroport-cannes", "noindex": False, "og_title": {}, "og_description": {}, "og_image": ""
            },
            "intro": {"fr": "L'aeroport le plus proche de Cannes est Nice Cote d'Azur (NCE), a environ 25 km. Transferts prives premium vers le Palais des Festivals et La Croisette.", "en": "The nearest major airport to Cannes is Nice Cote d'Azur Airport (NCE), approximately 25 km away.", "ru": "Ближайший аэропорт к Каннам - Ницца Лазурный Берег (NCE), около 25 км.", "hy": ""},
            "main_content": {}, "blocks": [], "faq": [], "cta_text": {}, "hero_image": "", "status": "published", "priority": 8, "related_pages": []
        },
        {
            "internal_name": "Transfert Aeroport Berlin - BER Brandenburg",
            "page_type": "city",
            "slug": {"fr": "/transfert-aeroport-berlin", "en": "/berlin-airport-transfer", "ru": "/taksi-iz-aeroporta-berlin", "hy": ""},
            "seo": {
                "title": {"fr": "Transfert Aeroport Berlin - BER Brandenburg | Zont", "en": "Berlin Airport Transfer - BER Brandenburg | Zont", "ru": "Трансфер из Аэропорта Берлина | Zont", "hy": ""},
                "meta_description": {"fr": "Chauffeur prive depuis l'aeroport Berlin Brandenburg vers le centre-ville. Prix fixes.", "en": "Professional private driver from Berlin Brandenburg Airport to city center.", "ru": "Профессиональный водитель из аэропорта Берлин-Бранденбург.", "hy": ""},
                "h1": {"fr": "Transfert Aeroport Berlin - BER Brandenburg", "en": "Berlin Airport Transfer - BER Brandenburg", "ru": "Трансфер из Аэропорта Берлина - BER Бранденбург", "hy": ""},
                "h2": {}, "canonical": "/transfert-aeroport-berlin", "noindex": False, "og_title": {}, "og_description": {}, "og_image": ""
            },
            "intro": {"fr": "L'aeroport Berlin Brandenburg (BER) est la principale porte d'entree de la capitale allemande.", "en": "Berlin Brandenburg Airport (BER) is the main international gateway to Germany's capital.", "ru": "Аэропорт Берлин-Бранденбург (BER) - главные ворота столицы Германии.", "hy": ""},
            "main_content": {}, "blocks": [], "faq": [], "cta_text": {}, "hero_image": "", "status": "published", "priority": 9, "related_pages": []
        },
        {
            "internal_name": "Transfert Aeroport Munich",
            "page_type": "city",
            "slug": {"fr": "/transfert-aeroport-munich", "en": "/munich-airport-transfer", "ru": "/taksi-iz-aeroporta-munhen", "hy": ""},
            "seo": {
                "title": {"fr": "Transfert Aeroport Munich - Franz Josef Strauss | Zont", "en": "Munich Airport Transfer - Franz Josef Strauss | Zont", "ru": "Трансфер из Аэропорта Мюнхена | Zont", "hy": ""},
                "meta_description": {"fr": "Chauffeur prive depuis l'aeroport de Munich vers le centre-ville et la Baviere. Prix fixes.", "en": "Professional private driver from Munich Airport to city center and Bavaria.", "ru": "Профессиональный водитель из аэропорта Мюнхена в центр города и Баварию.", "hy": ""},
                "h1": {"fr": "Transfert Aeroport Munich - Franz Josef Strauss", "en": "Munich Airport Transfer - Franz Josef Strauss", "ru": "Трансфер из Аэропорта Мюнхена", "hy": ""},
                "h2": {}, "canonical": "/transfert-aeroport-munich", "noindex": False, "og_title": {}, "og_description": {}, "og_image": ""
            },
            "intro": {"fr": "L'aeroport de Munich (MUC) est situe a 28 km au nord-est de la ville.", "en": "Munich Airport (MUC) is located 28 km northeast of Munich.", "ru": "Аэропорт Мюнхена (MUC) расположен в 28 км к северо-востоку от города.", "hy": ""},
            "main_content": {}, "blocks": [], "faq": [], "cta_text": {}, "hero_image": "", "status": "published", "priority": 10, "related_pages": []
        },
        {
            "internal_name": "Transfert Aeroport Rome - Fiumicino & Ciampino",
            "page_type": "city",
            "slug": {"fr": "/transfert-aeroport-rome", "en": "/rome-airport-transfer", "ru": "/taksi-iz-aeroporta-rim", "hy": ""},
            "seo": {
                "title": {"fr": "Transfert Aeroport Rome - Fiumicino et Ciampino | Zont", "en": "Rome Airport Transfer - Fiumicino & Ciampino | Zont", "ru": "Трансфер из Аэропорта Рима | Zont", "hy": ""},
                "meta_description": {"fr": "Chauffeur prive depuis les aeroports de Rome vers le centre-ville, le Vatican. Prix fixes.", "en": "Private driver from Rome airports to city center, Vatican. Fixed prices.", "ru": "Частный водитель из аэропортов Рима в центр города, Ватикан.", "hy": ""},
                "h1": {"fr": "Transfert Aeroport Rome - Fiumicino et Ciampino", "en": "Rome Airport Transfer - Fiumicino & Ciampino", "ru": "Трансфер из Аэропорта Рима - Фьюмичино и Чампино", "hy": ""},
                "h2": {}, "canonical": "/transfert-aeroport-rome", "noindex": False, "og_title": {}, "og_description": {}, "og_image": ""
            },
            "intro": {"fr": "Rome possede deux aeroports : Fiumicino (FCO) a 32 km et Ciampino (CIA) a 15 km. Transferts prives premium.", "en": "Rome has two airports: Fiumicino (FCO) at 32 km and Ciampino (CIA) at 15 km.", "ru": "Рим имеет два аэропорта: Фьюмичино (FCO) - 32 км и Чампино (CIA) - 15 км.", "hy": ""},
            "main_content": {}, "blocks": [], "faq": [], "cta_text": {}, "hero_image": "", "status": "published", "priority": 11, "related_pages": []
        },
        {
            "internal_name": "Transfert Aeroport Milan - Malpensa, Linate, Bergame",
            "page_type": "city",
            "slug": {"fr": "/transfert-aeroport-milan", "en": "/milan-airport-transfer", "ru": "/taksi-iz-aeroporta-milan", "hy": ""},
            "seo": {
                "title": {"fr": "Transfert Aeroport Milan - Malpensa, Linate et Bergame | Zont", "en": "Milan Airport Transfer - Malpensa, Linate & Bergamo | Zont", "ru": "Трансфер из Аэропорта Милана | Zont", "hy": ""},
                "meta_description": {"fr": "Chauffeur prive depuis les aeroports de Milan vers le centre-ville, le Duomo. Prix fixes.", "en": "Private driver from Milan airports to city center, Duomo area. Fixed prices.", "ru": "Частный водитель из аэропортов Милана в центр города.", "hy": ""},
                "h1": {"fr": "Transfert Aeroport Milan", "en": "Milan Airport Transfer", "ru": "Трансфер из Аэропорта Милана", "hy": ""},
                "h2": {}, "canonical": "/transfert-aeroport-milan", "noindex": False, "og_title": {}, "og_description": {}, "og_image": ""
            },
            "intro": {"fr": "Milan dispose de trois aeroports : Malpensa (MXP) a 50 km, Linate (LIN) a 7 km et Bergame (BGY) a 45 km.", "en": "Milan has three airports: Malpensa (MXP) at 50 km, Linate (LIN) at 7 km, and Bergamo (BGY) at 45 km.", "ru": "Три аэропорта Милана: Мальпенса (MXP) - 50 км, Линате (LIN) - 7 км, Бергамо (BGY) - 45 км.", "hy": ""},
            "main_content": {}, "blocks": [], "faq": [], "cta_text": {}, "hero_image": "", "status": "published", "priority": 12, "related_pages": []
        },
        {
            "internal_name": "Transfert Aeroport Alicante",
            "page_type": "city",
            "slug": {"fr": "/transfert-aeroport-alicante", "en": "/alicante-airport-transfer", "ru": "/taksi-iz-aeroporta-alikante", "hy": ""},
            "seo": {
                "title": {"fr": "Transfert Aeroport Alicante - Voiture Privee | Zont", "en": "Alicante Airport Transfer - Private Car Service | Zont", "ru": "Трансфер из Аэропорта Аликанте | Zont", "hy": ""},
                "meta_description": {"fr": "Chauffeur prive depuis l'aeroport d'Alicante vers la Costa Blanca, Benidorm. Prix fixes.", "en": "Professional private driver from Alicante Airport to Costa Blanca, Benidorm.", "ru": "Частный водитель из аэропорта Аликанте на Коста Бланку.", "hy": ""},
                "h1": {"fr": "Transfert Aeroport Alicante", "en": "Alicante Airport Transfer", "ru": "Трансфер из Аэропорта Аликанте", "hy": ""},
                "h2": {}, "canonical": "/transfert-aeroport-alicante", "noindex": False, "og_title": {}, "og_description": {}, "og_image": ""
            },
            "intro": {"fr": "L'aeroport d'Alicante-Elche (ALC) est la porte d'entree de la Costa Blanca espagnole.", "en": "Alicante-Elche Airport (ALC) is the gateway to Spain's Costa Blanca.", "ru": "Аэропорт Аликанте-Эльче (ALC) - ворота на Коста Бланку.", "hy": ""},
            "main_content": {}, "blocks": [], "faq": [], "cta_text": {}, "hero_image": "", "status": "published", "priority": 13, "related_pages": []
        },
        {
            "internal_name": "Transfert Aeroport Barcelone - El Prat",
            "page_type": "city",
            "slug": {"fr": "/transfert-aeroport-barcelone", "en": "/barcelona-airport-transfer", "ru": "/taksi-iz-aeroporta-barselona", "hy": ""},
            "seo": {
                "title": {"fr": "Transfert Aeroport Barcelone - El Prat | Zont", "en": "Barcelona Airport Transfer - El Prat Airport | Zont", "ru": "Трансфер из Аэропорта Барселоны | Zont", "hy": ""},
                "meta_description": {"fr": "Chauffeur prive depuis l'aeroport de Barcelone vers La Rambla, le Quartier Gothique. Prix fixes.", "en": "Private driver from Barcelona Airport to La Rambla, Gothic Quarter.", "ru": "Частный водитель из аэропорта Барселоны на Рамблу.", "hy": ""},
                "h1": {"fr": "Transfert Aeroport Barcelone - El Prat", "en": "Barcelona Airport Transfer - El Prat Airport", "ru": "Трансфер из Аэропорта Барселоны - Эль-Прат", "hy": ""},
                "h2": {}, "canonical": "/transfert-aeroport-barcelone", "noindex": False, "og_title": {}, "og_description": {}, "og_image": ""
            },
            "intro": {"fr": "L'aeroport de Barcelone-El Prat (BCN) est le deuxieme aeroport le plus frequente d'Espagne, a 12 km du centre.", "en": "Barcelona-El Prat Airport (BCN) is Spain's second busiest airport, 12 km from the city.", "ru": "Аэропорт Барселона-Эль-Прат (BCN) - второй по загруженности в Испании.", "hy": ""},
            "main_content": {}, "blocks": [], "faq": [], "cta_text": {}, "hero_image": "", "status": "published", "priority": 14, "related_pages": []
        },
        {
            "internal_name": "Transfert Aeroport Erevan - Zvartnots",
            "page_type": "city",
            "slug": {"fr": "/transfert-aeroport-erevan", "en": "/yerevan-airport-transfer", "ru": "/taksi-iz-aeroporta-erevan", "hy": ""},
            "seo": {
                "title": {"fr": "Transfert Aeroport Erevan - Zvartnots | Zont", "en": "Yerevan Airport Transfer - Zvartnots | Zont", "ru": "Трансфер из Аэропорта Еревана | Zont", "hy": ""},
                "meta_description": {"fr": "Chauffeur professionnel depuis l'aeroport de Zvartnots vers Erevan centre. Prix fixes abordables.", "en": "Professional driver from Zvartnots Airport to Yerevan city center. Affordable fixed prices.", "ru": "Профессиональный водитель из аэропорта Звартноц в центр Еревана.", "hy": ""},
                "h1": {"fr": "Transfert Aeroport Erevan - Zvartnots", "en": "Yerevan Airport Transfer - Zvartnots International", "ru": "Трансфер из Аэропорта Еревана - Звартноц", "hy": ""},
                "h2": {}, "canonical": "/transfert-aeroport-erevan", "noindex": False, "og_title": {}, "og_description": {}, "og_image": ""
            },
            "intro": {"fr": "L'aeroport international de Zvartnots (EVN) est situe a 12 km d'Erevan.", "en": "Zvartnots International Airport (EVN) is located 12 km west of Yerevan.", "ru": "Международный аэропорт Звартноц (EVN) расположен в 12 км от Еревана.", "hy": ""},
            "main_content": {}, "blocks": [], "faq": [], "cta_text": {}, "hero_image": "", "status": "published", "priority": 15, "related_pages": []
        },
    ]

    for p in pages:
        p["id"] = str(uuid.uuid4())
        p["created_at"] = now
        p["updated_at"] = now
        p["created_by"] = "admin@zont.cab"
    await db.cms_pages.insert_many(pages)
    print(f"Inserted {len(pages)} pages.")

    # ========== PLACES ==========
    places = [
        {"name": {"fr": "Paris Charles de Gaulle (CDG)", "en": "Paris Charles de Gaulle (CDG)", "ru": "Париж Шарль де Голль (CDG)", "hy": ""}, "place_type": "airport", "country": "France", "airport_code": "CDG", "description_short": {"fr": "Plus grand aeroport de France, 25 km au nord-est de Paris", "en": "France's largest airport, 25 km northeast of Paris", "ru": "Крупнейший аэропорт Франции, 25 км от Парижа", "hy": ""}, "description_seo": {}, "price_from": 65, "keywords": ["cdg", "charles de gaulle", "roissy", "paris airport"], "image": "", "status": "active"},
        {"name": {"fr": "Paris Orly (ORY)", "en": "Paris Orly (ORY)", "ru": "Париж Орли (ORY)", "hy": ""}, "place_type": "airport", "country": "France", "airport_code": "ORY", "description_short": {"fr": "Deuxieme aeroport parisien, 13 km au sud", "en": "Second Paris airport, 13 km south", "ru": "Второй аэропорт Парижа, 13 км к югу", "hy": ""}, "description_seo": {}, "price_from": 45, "keywords": ["orly", "paris orly"], "image": "", "status": "active"},
        {"name": {"fr": "Paris Beauvais (BVA)", "en": "Paris Beauvais (BVA)", "ru": "Париж Бове (BVA)", "hy": ""}, "place_type": "airport", "country": "France", "airport_code": "BVA", "description_short": {"fr": "Hub low-cost, 85 km au nord de Paris", "en": "Low-cost hub, 85 km north of Paris", "ru": "Хаб лоукостеров, 85 км от Парижа", "hy": ""}, "description_seo": {}, "price_from": 120, "keywords": ["beauvais", "bva", "ryanair"], "image": "", "status": "active"},
        {"name": {"fr": "Nice Cote d'Azur (NCE)", "en": "Nice Cote d'Azur (NCE)", "ru": "Ницца Лазурный Берег (NCE)", "hy": ""}, "place_type": "airport", "country": "France", "airport_code": "NCE", "description_short": {"fr": "3eme aeroport de France, Cote d'Azur", "en": "France's 3rd busiest airport, French Riviera", "ru": "3-й аэропорт Франции, Лазурный Берег", "hy": ""}, "description_seo": {}, "price_from": 35, "keywords": ["nice", "cote azur", "nce"], "image": "", "status": "active"},
        {"name": {"fr": "Berlin Brandenburg (BER)", "en": "Berlin Brandenburg (BER)", "ru": "Берлин Бранденбург (BER)", "hy": ""}, "place_type": "airport", "country": "Allemagne", "airport_code": "BER", "description_short": {"fr": "Aeroport principal de Berlin", "en": "Berlin's main airport", "ru": "Главный аэропорт Берлина", "hy": ""}, "description_seo": {}, "price_from": 45, "keywords": ["berlin", "ber", "brandenburg"], "image": "", "status": "active"},
        {"name": {"fr": "Munich (MUC)", "en": "Munich (MUC)", "ru": "Мюнхен (MUC)", "hy": ""}, "place_type": "airport", "country": "Allemagne", "airport_code": "MUC", "description_short": {"fr": "Aeroport de Munich, Baviere", "en": "Munich Airport, Bavaria", "ru": "Аэропорт Мюнхена, Бавария", "hy": ""}, "description_seo": {}, "price_from": 55, "keywords": ["munich", "muc", "baviere"], "image": "", "status": "active"},
        {"name": {"fr": "Rome Fiumicino (FCO)", "en": "Rome Fiumicino (FCO)", "ru": "Рим Фьюмичино (FCO)", "hy": ""}, "place_type": "airport", "country": "Italie", "airport_code": "FCO", "description_short": {"fr": "Aeroport principal de Rome, 32 km du centre", "en": "Rome's main airport, 32 km from center", "ru": "Главный аэропорт Рима, 32 км от центра", "hy": ""}, "description_seo": {}, "price_from": 50, "keywords": ["rome", "fiumicino", "fco"], "image": "", "status": "active"},
        {"name": {"fr": "Milan Malpensa (MXP)", "en": "Milan Malpensa (MXP)", "ru": "Милан Мальпенса (MXP)", "hy": ""}, "place_type": "airport", "country": "Italie", "airport_code": "MXP", "description_short": {"fr": "Hub international de Milan, 50 km", "en": "Milan's international hub, 50 km", "ru": "Международный хаб Милана, 50 км", "hy": ""}, "description_seo": {}, "price_from": 70, "keywords": ["milan", "malpensa", "mxp"], "image": "", "status": "active"},
        {"name": {"fr": "Barcelone El Prat (BCN)", "en": "Barcelona El Prat (BCN)", "ru": "Барселона Эль-Прат (BCN)", "hy": ""}, "place_type": "airport", "country": "Espagne", "airport_code": "BCN", "description_short": {"fr": "2eme aeroport d'Espagne, 12 km de Barcelone", "en": "Spain's 2nd busiest airport, 12 km from Barcelona", "ru": "2-й аэропорт Испании, 12 км от Барселоны", "hy": ""}, "description_seo": {}, "price_from": 39, "keywords": ["barcelona", "bcn", "el prat"], "image": "", "status": "active"},
        {"name": {"fr": "Alicante-Elche (ALC)", "en": "Alicante-Elche (ALC)", "ru": "Аликанте-Эльче (ALC)", "hy": ""}, "place_type": "airport", "country": "Espagne", "airport_code": "ALC", "description_short": {"fr": "Porte d'entree de la Costa Blanca", "en": "Gateway to Costa Blanca", "ru": "Ворота Коста Бланки", "hy": ""}, "description_seo": {}, "price_from": 30, "keywords": ["alicante", "alc", "costa blanca"], "image": "", "status": "active"},
        {"name": {"fr": "Erevan Zvartnots (EVN)", "en": "Yerevan Zvartnots (EVN)", "ru": "Ереван Звартноц (EVN)", "hy": ""}, "place_type": "airport", "country": "Armenie", "airport_code": "EVN", "description_short": {"fr": "Aeroport international d'Erevan, 12 km", "en": "Yerevan's international airport, 12 km", "ru": "Международный аэропорт Еревана, 12 км", "hy": ""}, "description_seo": {}, "price_from": 15, "keywords": ["yerevan", "erevan", "zvartnots", "evn"], "image": "", "status": "active"},
        # Cities
        {"name": {"fr": "Nice", "en": "Nice", "ru": "Ницца", "hy": ""}, "place_type": "city", "country": "France", "airport_code": "", "description_short": {"fr": "Capitale de la Cote d'Azur", "en": "Capital of the French Riviera", "ru": "Столица Лазурного Берега", "hy": ""}, "description_seo": {}, "price_from": 35, "keywords": ["nice", "cote azur", "riviera"], "image": "", "status": "active"},
        {"name": {"fr": "Monaco", "en": "Monaco", "ru": "Монако", "hy": ""}, "place_type": "city", "country": "Monaco", "airport_code": "", "description_short": {"fr": "Principaute de Monaco, Monte-Carlo", "en": "Principality of Monaco, Monte-Carlo", "ru": "Княжество Монако, Монте-Карло", "hy": ""}, "description_seo": {}, "price_from": 65, "keywords": ["monaco", "monte-carlo"], "image": "", "status": "active"},
        {"name": {"fr": "Cannes", "en": "Cannes", "ru": "Канны", "hy": ""}, "place_type": "city", "country": "France", "airport_code": "", "description_short": {"fr": "Festival de Cannes, La Croisette", "en": "Cannes Film Festival, La Croisette", "ru": "Каннский фестиваль, Круазетт", "hy": ""}, "description_seo": {}, "price_from": 70, "keywords": ["cannes", "croisette", "festival"], "image": "", "status": "active"},
        {"name": {"fr": "Paris", "en": "Paris", "ru": "Париж", "hy": ""}, "place_type": "city", "country": "France", "airport_code": "", "description_short": {"fr": "Capitale de la France, Ville Lumiere", "en": "Capital of France, City of Light", "ru": "Столица Франции, Город Света", "hy": ""}, "description_seo": {}, "price_from": 25, "keywords": ["paris", "france", "ville lumiere"], "image": "", "status": "active"},
        {"name": {"fr": "Berlin", "en": "Berlin", "ru": "Берлин", "hy": ""}, "place_type": "city", "country": "Allemagne", "airport_code": "", "description_short": {"fr": "Capitale de l'Allemagne", "en": "Capital of Germany", "ru": "Столица Германии", "hy": ""}, "description_seo": {}, "price_from": 45, "keywords": ["berlin", "allemagne", "germany"], "image": "", "status": "active"},
        {"name": {"fr": "Munich", "en": "Munich", "ru": "Мюнхен", "hy": ""}, "place_type": "city", "country": "Allemagne", "airport_code": "", "description_short": {"fr": "Baviere, Oktoberfest, BMW World", "en": "Bavaria, Oktoberfest, BMW World", "ru": "Бавария, Октоберфест, BMW World", "hy": ""}, "description_seo": {}, "price_from": 55, "keywords": ["munich", "baviere", "oktoberfest"], "image": "", "status": "active"},
        {"name": {"fr": "Rome", "en": "Rome", "ru": "Рим", "hy": ""}, "place_type": "city", "country": "Italie", "airport_code": "", "description_short": {"fr": "Ville eternelle, Vatican, Colisee", "en": "Eternal City, Vatican, Colosseum", "ru": "Вечный город, Ватикан, Колизей", "hy": ""}, "description_seo": {}, "price_from": 50, "keywords": ["rome", "vatican", "colisee"], "image": "", "status": "active"},
        {"name": {"fr": "Milan", "en": "Milan", "ru": "Милан", "hy": ""}, "place_type": "city", "country": "Italie", "airport_code": "", "description_short": {"fr": "Capitale de la mode, Duomo", "en": "Fashion capital, Duomo", "ru": "Столица моды, Дуомо", "hy": ""}, "description_seo": {}, "price_from": 70, "keywords": ["milan", "duomo", "mode"], "image": "", "status": "active"},
        {"name": {"fr": "Barcelone", "en": "Barcelona", "ru": "Барселона", "hy": ""}, "place_type": "city", "country": "Espagne", "airport_code": "", "description_short": {"fr": "Sagrada Familia, La Rambla", "en": "Sagrada Familia, La Rambla", "ru": "Саграда Фамилия, Рамбла", "hy": ""}, "description_seo": {}, "price_from": 39, "keywords": ["barcelona", "barcelone", "sagrada familia"], "image": "", "status": "active"},
        {"name": {"fr": "Alicante", "en": "Alicante", "ru": "Аликанте", "hy": ""}, "place_type": "city", "country": "Espagne", "airport_code": "", "description_short": {"fr": "Costa Blanca, Benidorm", "en": "Costa Blanca, Benidorm", "ru": "Коста Бланка, Бенидорм", "hy": ""}, "description_seo": {}, "price_from": 30, "keywords": ["alicante", "costa blanca", "benidorm"], "image": "", "status": "active"},
        {"name": {"fr": "Erevan", "en": "Yerevan", "ru": "Ереван", "hy": ""}, "place_type": "city", "country": "Armenie", "airport_code": "", "description_short": {"fr": "Capitale de l'Armenie", "en": "Capital of Armenia", "ru": "Столица Армении", "hy": ""}, "description_seo": {}, "price_from": 15, "keywords": ["yerevan", "erevan", "armenie"], "image": "", "status": "active"},
        # Train stations
        {"name": {"fr": "Gare du Nord", "en": "Gare du Nord", "ru": "Гар дю Нор", "hy": ""}, "place_type": "station", "country": "France", "airport_code": "", "description_short": {"fr": "Eurostar, Thalys - Paris", "en": "Eurostar, Thalys - Paris", "ru": "Eurostar, Thalys - Париж", "hy": ""}, "description_seo": {}, "price_from": 25, "keywords": ["gare du nord", "eurostar", "thalys"], "image": "", "status": "active"},
        {"name": {"fr": "Gare de Lyon", "en": "Gare de Lyon", "ru": "Гар де Лион", "hy": ""}, "place_type": "station", "country": "France", "airport_code": "", "description_short": {"fr": "TGV Sud - Paris", "en": "TGV South - Paris", "ru": "TGV Юг - Париж", "hy": ""}, "description_seo": {}, "price_from": 25, "keywords": ["gare de lyon", "tgv sud"], "image": "", "status": "active"},
        {"name": {"fr": "Gare Montparnasse", "en": "Gare Montparnasse", "ru": "Монпарнас", "hy": ""}, "place_type": "station", "country": "France", "airport_code": "", "description_short": {"fr": "TGV Ouest - Paris", "en": "TGV West - Paris", "ru": "TGV Запад - Париж", "hy": ""}, "description_seo": {}, "price_from": 25, "keywords": ["montparnasse", "tgv ouest"], "image": "", "status": "active"},
        {"name": {"fr": "Gare de l'Est", "en": "Gare de l'Est", "ru": "Гар де л'Эст", "hy": ""}, "place_type": "station", "country": "France", "airport_code": "", "description_short": {"fr": "TGV Est - Paris", "en": "TGV East - Paris", "ru": "TGV Восток - Париж", "hy": ""}, "description_seo": {}, "price_from": 25, "keywords": ["gare est", "tgv est"], "image": "", "status": "active"},
        {"name": {"fr": "Gare Saint-Lazare", "en": "Gare Saint-Lazare", "ru": "Сен-Лазар", "hy": ""}, "place_type": "station", "country": "France", "airport_code": "", "description_short": {"fr": "Normandie - Paris", "en": "Normandy - Paris", "ru": "Нормандия - Париж", "hy": ""}, "description_seo": {}, "price_from": 25, "keywords": ["saint lazare", "normandie"], "image": "", "status": "active"},
    ]

    for p in places:
        p["id"] = str(uuid.uuid4())
        p["created_at"] = now
        p["updated_at"] = now
        p["associated_destinations"] = []
    await db.cms_places.insert_many(places)
    print(f"Inserted {len(places)} places.")

    # ========== TRUST BLOCKS ==========
    trust_blocks = [
        {"title": {"fr": "Accueil Personnalise", "en": "Meet & Greet", "ru": "Встреча в Аэропорту", "hy": ""}, "text": {"fr": "Votre chauffeur vous attend aux arrivees avec une pancarte a votre nom. 60 min d'attente gratuites pour les retards de vol.", "en": "Your driver waits at arrivals with a personalized name sign. 60 min free waiting for flight delays.", "ru": "Водитель ждет вас в зале прилета с табличкой. 60 минут ожидания бесплатно.", "hy": ""}, "icon": "plane", "active": True, "order": 0},
        {"title": {"fr": "Suivi des Vols", "en": "Flight Tracking", "ru": "Отслеживание Рейсов", "hy": ""}, "text": {"fr": "Surveillance en temps reel de votre vol. Aucun supplement en cas de retard.", "en": "Real-time monitoring of your flight. No extra charge if delayed.", "ru": "Мониторинг рейса в реальном времени. Без доплаты за задержку.", "hy": ""}, "icon": "clock", "active": True, "order": 1},
        {"title": {"fr": "Vehicules Premium", "en": "Premium Vehicles", "ru": "Премиум Автомобили", "hy": ""}, "text": {"fr": "Mercedes, BMW. Propres, climatises, moins de 3 ans.", "en": "Mercedes, BMW. Clean, air-conditioned, less than 3 years old.", "ru": "Mercedes, BMW. Чистые, с кондиционером, не старше 3 лет.", "hy": ""}, "icon": "star", "active": True, "order": 2},
        {"title": {"fr": "Prix Fixes Garantis", "en": "Fixed Prices", "ru": "Фиксированные Цены", "hy": ""}, "text": {"fr": "Prix confirme a la reservation. Pas de frais caches, peages inclus.", "en": "Price confirmed at booking. No hidden fees, tolls included.", "ru": "Цена подтверждается при бронировании. Без скрытых платежей.", "hy": ""}, "icon": "shield", "active": True, "order": 3},
        {"title": {"fr": "Paiement Securise", "en": "Secure Payment", "ru": "Безопасная Оплата", "hy": ""}, "text": {"fr": "Paiement en ligne securise ou paiement au chauffeur. Annulation gratuite 24h avant.", "en": "Secure online payment or pay the driver. Free cancellation 24h before.", "ru": "Безопасная онлайн-оплата или оплата водителю. Бесплатная отмена за 24ч.", "hy": ""}, "icon": "credit-card", "active": True, "order": 4},
        {"title": {"fr": "Support 24/7", "en": "24/7 Support", "ru": "Поддержка 24/7", "hy": ""}, "text": {"fr": "Notre equipe est disponible 24h/24, 7j/7 par telephone, email et chat.", "en": "Our team is available 24/7 by phone, email and chat.", "ru": "Наша команда доступна 24/7 по телефону, email и чату.", "hy": ""}, "icon": "headphones", "active": True, "order": 5},
    ]

    for b in trust_blocks:
        b["id"] = str(uuid.uuid4())
        b["created_at"] = now
        b["updated_at"] = now
    await db.cms_trust_blocks.insert_many(trust_blocks)
    print(f"Inserted {len(trust_blocks)} trust blocks.")

    # ========== HOMEPAGE CONFIG ==========
    homepage = {
        "id": "homepage",
        "title": {"fr": "Transfert Aeroport Premium", "en": "Premium Airport Transfer", "ru": "Премиум Трансфер из Аэропорта", "hy": ""},
        "subtitle": {"fr": "Chauffeurs prives professionnels dans 120+ villes. Prix fixes, suivi de vol, accueil personnalise.", "en": "Professional private drivers in 120+ cities. Fixed prices, flight tracking, meet & greet.", "ru": "Профессиональные водители в 120+ городах. Фиксированные цены, отслеживание рейсов.", "hy": ""},
        "review_badge": {"fr": "4.9/5 (3 200+ avis)", "en": "4.9/5 (3,200+ reviews)", "ru": "4.9/5 (3 200+ отзывов)", "hy": ""},
        "stats": [
            {"value": "50K+", "label": {"fr": "Courses Effectuees", "en": "Completed Trips", "ru": "Выполненных Поездок", "hy": ""}},
            {"value": "120+", "label": {"fr": "Villes", "en": "Cities", "ru": "Городов", "hy": ""}},
            {"value": "24/7", "label": {"fr": "Service", "en": "Service", "ru": "Сервис", "hy": ""}},
            {"value": "4.9/5", "label": {"fr": "Note", "en": "Rating", "ru": "Рейтинг", "hy": ""}},
        ],
        "advantages": [
            {"title": {"fr": "Accueil Personnalise", "en": "Meet & Greet", "ru": "Встреча в Аэропорту", "hy": ""}, "text": {"fr": "Chauffeur aux arrivees avec pancarte a votre nom. 60 min d'attente gratuites.", "en": "Driver waits at arrivals with personalized name sign. 60 min free waiting.", "ru": "Водитель ждет в зале прилета с табличкой. 60 мин бесплатного ожидания.", "hy": ""}, "icon": "plane"},
            {"title": {"fr": "Suivi des Vols", "en": "Flight Tracking", "ru": "Отслеживание Рейсов", "hy": ""}, "text": {"fr": "Surveillance en temps reel. Aucun supplement pour retard.", "en": "Real-time monitoring. No extra charge for delays.", "ru": "Мониторинг в реальном времени. Без доплаты.", "hy": ""}, "icon": "clock"},
            {"title": {"fr": "Vehicules Premium", "en": "Premium Vehicles", "ru": "Премиум Автомобили", "hy": ""}, "text": {"fr": "Mercedes, BMW. Propres, climatises, moins de 3 ans.", "en": "Mercedes, BMW. Clean, air-conditioned, less than 3 years.", "ru": "Mercedes, BMW. Чистые, с кондиционером.", "hy": ""}, "icon": "star"},
            {"title": {"fr": "Prix Fixes Garantis", "en": "Fixed Prices", "ru": "Фиксированные Цены", "hy": ""}, "text": {"fr": "Prix confirme a la reservation. Peages inclus.", "en": "Price confirmed at booking. Tolls included.", "ru": "Цена при бронировании. Все включено.", "hy": ""}, "icon": "shield"},
        ],
        "popular_destinations": [],
        "cta_title": {"fr": "Pret a Reserver Votre Transfert ?", "en": "Ready to Book Your Transfer?", "ru": "Готовы Забронировать Трансфер?", "hy": ""},
        "cta_button": {"fr": "Reserver Maintenant", "en": "Book Now", "ru": "Забронировать", "hy": ""},
        "sections_order": ["hero", "stats", "advantages", "destinations", "reviews", "cta"],
        "updated_at": now,
    }
    await db.cms_homepage.update_one({"id": "homepage"}, {"$set": homepage}, upsert=True)
    print("Inserted homepage config.")

    # ========== FAQs ==========
    faqs = [
        {"question": {"fr": "Combien coute un transfert aeroport ?", "en": "How much does an airport transfer cost?", "ru": "Сколько стоит трансфер из аэропорта?", "hy": ""}, "answer": {"fr": "Les prix varient selon la destination. Par exemple : CDG vers Paris centre a partir de 65 EUR, Nice aeroport vers Nice centre a partir de 35 EUR. Le prix est fixe et confirme a la reservation.", "en": "Prices vary by destination. For example: CDG to Paris center from 65 EUR, Nice airport to Nice center from 35 EUR. Price is fixed and confirmed at booking.", "ru": "Цены зависят от направления. Например: CDG в центр Парижа от 65 EUR, аэропорт Ниццы в центр от 35 EUR.", "hy": ""}, "order": 0, "active": True, "page_id": None},
        {"question": {"fr": "Comment fonctionne l'accueil a l'aeroport ?", "en": "How does the airport meet & greet work?", "ru": "Как происходит встреча в аэропорту?", "hy": ""}, "answer": {"fr": "Votre chauffeur vous attend dans le hall des arrivees avec une pancarte a votre nom. 60 minutes d'attente gratuites incluses en cas de retard de vol.", "en": "Your driver waits in the arrivals hall with a personalized name sign. 60 minutes free waiting included for flight delays.", "ru": "Водитель ждет вас в зале прилета с именной табличкой. 60 минут бесплатного ожидания при задержке рейса.", "hy": ""}, "order": 1, "active": True, "page_id": None},
        {"question": {"fr": "Puis-je annuler ma reservation ?", "en": "Can I cancel my booking?", "ru": "Могу ли я отменить бронирование?", "hy": ""}, "answer": {"fr": "Oui, l'annulation est gratuite jusqu'a 24 heures avant le transfert. Au-dela, des frais peuvent s'appliquer.", "en": "Yes, cancellation is free up to 24 hours before the transfer. After that, fees may apply.", "ru": "Да, отмена бесплатна до 24 часов до трансфера. После этого могут применяться сборы.", "hy": ""}, "order": 2, "active": True, "page_id": None},
        {"question": {"fr": "Quels vehicules proposez-vous ?", "en": "What vehicles do you offer?", "ru": "Какие автомобили вы предлагаете?", "hy": ""}, "answer": {"fr": "Nous proposons des berlines premium (Mercedes Classe E), des berlines de luxe (Mercedes Classe S), des monospaces (Mercedes Classe V, 6 passagers) et des minibus (8 passagers).", "en": "We offer premium sedans (Mercedes E-Class), luxury sedans (Mercedes S-Class), minivans (Mercedes V-Class, 6 passengers), and minibuses (8 passengers).", "ru": "Мы предлагаем премиум седаны (Mercedes E-Class), люкс седаны (Mercedes S-Class), минивэны (Mercedes V-Class, 6 пассажиров) и микроавтобусы (8 пассажиров).", "hy": ""}, "order": 3, "active": True, "page_id": None},
        {"question": {"fr": "Suivez-vous mon vol en temps reel ?", "en": "Do you track my flight in real-time?", "ru": "Вы отслеживаете мой рейс в реальном времени?", "hy": ""}, "answer": {"fr": "Oui, nous surveillons votre vol en temps reel. Si votre vol est en retard, votre chauffeur ajuste son heure d'arrivee automatiquement. Aucun supplement.", "en": "Yes, we monitor your flight in real-time. If your flight is delayed, your driver adjusts arrival time automatically. No extra charge.", "ru": "Да, мы отслеживаем ваш рейс в реальном времени. При задержке водитель автоматически корректирует время. Без доплаты.", "hy": ""}, "order": 4, "active": True, "page_id": None},
        {"question": {"fr": "Comment payer ?", "en": "How can I pay?", "ru": "Как можно оплатить?", "hy": ""}, "answer": {"fr": "Vous pouvez payer en ligne par carte bancaire (Visa, Mastercard, AMEX) lors de la reservation, ou payer directement au chauffeur en especes ou par carte.", "en": "You can pay online by credit card (Visa, Mastercard, AMEX) at booking, or pay the driver directly in cash or by card.", "ru": "Вы можете оплатить онлайн картой (Visa, Mastercard, AMEX) при бронировании или оплатить водителю наличными или картой.", "hy": ""}, "order": 5, "active": True, "page_id": None},
    ]

    for f in faqs:
        f["id"] = str(uuid.uuid4())
        f["created_at"] = now
    await db.cms_faqs.insert_many(faqs)
    print(f"Inserted {len(faqs)} FAQs.")

    print("\n=== SEED COMPLETE ===")
    print(f"Pages: {len(pages)}")
    print(f"Places: {len(places)} ({sum(1 for p in places if p['place_type']=='airport')} airports, {sum(1 for p in places if p['place_type']=='city')} cities, {sum(1 for p in places if p['place_type']=='station')} stations)")
    print(f"Trust Blocks: {len(trust_blocks)}")
    print(f"FAQs: {len(faqs)}")
    print(f"Homepage: 1 config")

    client.close()

if __name__ == "__main__":
    asyncio.run(seed())
