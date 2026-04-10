import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, Send } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const API = process.env.REACT_APP_BACKEND_URL;

const TEXTS = {
  fr: {
    title: 'Votre avis compte',
    subtitle: 'Partagez votre experience de voyage avec Zont',
    name: 'Votre nom',
    namePlaceholder: 'Jean Dupont',
    rating: 'Votre note',
    comment: 'Votre avis',
    commentPlaceholder: 'Racontez-nous votre experience...',
    tripRef: 'Reference de course (optionnel)',
    tripRefPlaceholder: 'Ex: 12345',
    submit: 'Envoyer mon avis',
    sending: 'Envoi en cours...',
    thankTitle: 'Merci pour votre avis !',
    thankText: 'Votre avis a ete soumis et sera publie apres validation par notre equipe.',
    required: 'Ce champ est requis',
    ratingLabels: ['', 'Mauvais', 'Moyen', 'Bien', 'Tres bien', 'Excellent'],
  },
  en: {
    title: 'Your review matters',
    subtitle: 'Share your travel experience with Zont',
    name: 'Your name',
    namePlaceholder: 'John Smith',
    rating: 'Your rating',
    comment: 'Your review',
    commentPlaceholder: 'Tell us about your experience...',
    tripRef: 'Trip reference (optional)',
    tripRefPlaceholder: 'E.g.: 12345',
    submit: 'Submit my review',
    sending: 'Sending...',
    thankTitle: 'Thank you for your review!',
    thankText: 'Your review has been submitted and will be published after validation by our team.',
    required: 'This field is required',
    ratingLabels: ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'],
  },
  ru: {
    title: '\u0412\u0430\u0448 \u043e\u0442\u0437\u044b\u0432 \u0432\u0430\u0436\u0435\u043d',
    subtitle: '\u041f\u043e\u0434\u0435\u043b\u0438\u0442\u0435\u0441\u044c \u0432\u0430\u0448\u0438\u043c \u043e\u043f\u044b\u0442\u043e\u043c \u043f\u043e\u0435\u0437\u0434\u043a\u0438 \u0441 Zont',
    name: '\u0412\u0430\u0448\u0435 \u0438\u043c\u044f',
    namePlaceholder: '\u0418\u0432\u0430\u043d \u041f\u0435\u0442\u0440\u043e\u0432',
    rating: '\u0412\u0430\u0448\u0430 \u043e\u0446\u0435\u043d\u043a\u0430',
    comment: '\u0412\u0430\u0448 \u043e\u0442\u0437\u044b\u0432',
    commentPlaceholder: '\u0420\u0430\u0441\u0441\u043a\u0430\u0436\u0438\u0442\u0435 \u043e \u0432\u0430\u0448\u0435\u043c \u043e\u043f\u044b\u0442\u0435...',
    tripRef: '\u041d\u043e\u043c\u0435\u0440 \u043f\u043e\u0435\u0437\u0434\u043a\u0438 (\u043d\u0435\u043e\u0431\u044f\u0437\u0430\u0442\u0435\u043b\u044c\u043d\u043e)',
    tripRefPlaceholder: '\u041d\u0430\u043f\u0440.: 12345',
    submit: '\u041e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c \u043e\u0442\u0437\u044b\u0432',
    sending: '\u041e\u0442\u043f\u0440\u0430\u0432\u043a\u0430...',
    thankTitle: '\u0421\u043f\u0430\u0441\u0438\u0431\u043e \u0437\u0430 \u0432\u0430\u0448 \u043e\u0442\u0437\u044b\u0432!',
    thankText: '\u0412\u0430\u0448 \u043e\u0442\u0437\u044b\u0432 \u043e\u0442\u043f\u0440\u0430\u0432\u043b\u0435\u043d \u0438 \u0431\u0443\u0434\u0435\u0442 \u043e\u043f\u0443\u0431\u043b\u0438\u043a\u043e\u0432\u0430\u043d \u043f\u043e\u0441\u043b\u0435 \u043f\u0440\u043e\u0432\u0435\u0440\u043a\u0438.',
    required: '\u042d\u0442\u043e \u043f\u043e\u043b\u0435 \u043e\u0431\u044f\u0437\u0430\u0442\u0435\u043b\u044c\u043d\u043e',
    ratingLabels: ['', '\u041f\u043b\u043e\u0445\u043e', '\u0421\u0440\u0435\u0434\u043d\u0435', '\u0425\u043e\u0440\u043e\u0448\u043e', '\u041e\u0447\u0435\u043d\u044c \u0445\u043e\u0440\u043e\u0448\u043e', '\u041e\u0442\u043b\u0438\u0447\u043d\u043e'],
  },
  hy: {
    title: '\u0541\u0565\u0580 \u056f\u0561\u0580\u056e\u056b\u0584\u0568 \u056f\u0561\u0580\u0587\u0578\u0580 \u0567',
    subtitle: '\u053f\u056b\u057d\u0565\u0584 \u0571\u0565\u0580 \u0583\u0578\u0580\u0571\u0568 Zont-\u056b \u0570\u0565\u057f',
    name: '\u0541\u0565\u0580 \u0561\u0576\u0578\u0582\u0576\u0568',
    namePlaceholder: '\u0540\u0578\u057e\u0570\u0561\u0576\u0576\u0565\u057d \u054a\u0565\u057f\u0580\u0578\u057d\u0575\u0561\u0576',
    rating: '\u0541\u0565\u0580 \u0563\u0576\u0561\u0570\u0561\u057f\u0561\u056f\u0561\u0576\u0568',
    comment: '\u0541\u0565\u0580 \u056f\u0561\u0580\u056e\u056b\u0584\u0568',
    commentPlaceholder: '\u054a\u0561\u057f\u0574\u0565\u0584 \u0571\u0565\u0580 \u0583\u0578\u0580\u0571\u056b \u0574\u0561\u057d\u056b\u0576...',
    tripRef: '\u0548\u0582\u0572\u0587\u0578\u0580\u0578\u0582\u0569\u0575\u0561\u0576 \u0570\u0561\u0574\u0561\u0580 (\u056f\u0561\u0574\u0561\u057e\u0578\u0580)',
    tripRefPlaceholder: '\u0555\u0580\u056b\u0576\u0561\u056f: 12345',
    submit: '\u0548\u0582\u0572\u0561\u0580\u056f\u0565\u056c \u056f\u0561\u0580\u056e\u056b\u0584\u0568',
    sending: '\u0548\u0582\u0572\u0561\u0580\u056f\u057e\u0578\u0582\u0574 \u0567...',
    thankTitle: '\u0547\u0576\u0578\u0580\u0570\u0561\u056f\u0561\u056c\u0578\u0582\u0569\u0575\u0578\u0582\u0576 \u0571\u0565\u0580 \u056f\u0561\u0580\u056e\u056b\u0584\u056b \u0570\u0561\u0574\u0561\u0580!',
    thankText: '\u0541\u0565\u0580 \u056f\u0561\u0580\u056e\u056b\u0584\u0568 \u0578\u0582\u0572\u0561\u0580\u056f\u057e\u0565\u056c \u0567 \u0587 \u056f\u0570\u0580\u0561\u057a\u0561\u0580\u0561\u056f\u057e\u056b \u057d\u057f\u0578\u0582\u0563\u0578\u0582\u0574\u056b\u0581 \u0570\u0565\u057f\u0578:',
    required: '\u054a\u0561\u0580\u057f\u0561\u0564\u056b\u0580 \u0567 \u056c\u0580\u0561\u0581\u0576\u0565\u056c',
    ratingLabels: ['', '\u054e\u0561\u057f', '\u0544\u056b\u057b\u056b\u0576', '\u053c\u0561\u057e', '\u0547\u0561\u057f \u056c\u0561\u057e', '\u0533\u0565\u0580\u0561\u0566\u0561\u0576\u0581'],
  },
};

const ReviewForm = () => {
  let lang = 'fr';
  try {
    const ctx = useLanguage();
    if (ctx?.language) lang = ctx.language;
  } catch {}

  const t = TEXTS[lang] || TEXTS.fr;

  const [name, setName] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [tripRef, setTripRef] = useState('');
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref') || params.get('trip');
    if (ref) setTripRef(ref);
  }, []);

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = t.required;
    if (rating === 0) errs.rating = t.required;
    if (!comment.trim()) errs.comment = t.required;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSending(true);
    try {
      const res = await fetch(`${API}/api/reviews/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author_name: name.trim(),
          rating,
          comment: comment.trim(),
          language: lang,
          trip_ref: tripRef.trim() || null,
        }),
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const activeRating = hoverRating || rating;

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0c1220] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3" data-testid="review-thank-title">{t.thankTitle}</h1>
          <p className="text-gray-400 leading-relaxed">{t.thankText}</p>
          <a href="/" className="inline-block mt-8 px-6 py-3 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition">
            Zont.cab
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c1220] flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <a href="/" className="inline-block mb-6">
            <span className="text-2xl font-bold text-white tracking-tight">ZONT</span>
          </a>
          <h1 className="text-3xl font-bold text-white mb-2" data-testid="review-form-title">{t.title}</h1>
          <p className="text-gray-400">{t.subtitle}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-[#141e2e] border border-gray-700/50 rounded-2xl p-6 sm:p-8 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">{t.name} *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); if (errors.name) setErrors(p => ({...p, name: null})); }}
              placeholder={t.namePlaceholder}
              className={`w-full px-4 py-3 bg-[#0c1220] border ${errors.name ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition`}
              data-testid="review-name-input"
            />
            {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">{t.rating} *</label>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => { setRating(i); if (errors.rating) setErrors(p => ({...p, rating: null})); }}
                    onMouseEnter={() => setHoverRating(i)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-110"
                    data-testid={`review-star-${i}`}
                  >
                    <Star className={`w-8 h-8 transition-colors ${i <= activeRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
                  </button>
                ))}
              </div>
              {activeRating > 0 && (
                <span className="text-sm text-gray-400 ml-2">{t.ratingLabels[activeRating]}</span>
              )}
            </div>
            {errors.rating && <p className="mt-1 text-xs text-red-400">{errors.rating}</p>}
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">{t.comment} *</label>
            <textarea
              value={comment}
              onChange={(e) => { setComment(e.target.value); if (errors.comment) setErrors(p => ({...p, comment: null})); }}
              placeholder={t.commentPlaceholder}
              rows={4}
              className={`w-full px-4 py-3 bg-[#0c1220] border ${errors.comment ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition resize-none`}
              data-testid="review-comment-input"
            />
            {errors.comment && <p className="mt-1 text-xs text-red-400">{errors.comment}</p>}
          </div>

          {/* Trip reference */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">{t.tripRef}</label>
            <input
              type="text"
              value={tripRef}
              onChange={(e) => setTripRef(e.target.value)}
              placeholder={t.tripRefPlaceholder}
              className="w-full px-4 py-3 bg-[#0c1220] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition"
              data-testid="review-tripref-input"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={sending}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            data-testid="review-submit-btn"
          >
            {sending ? (
              <span>{t.sending}</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>{t.submit}</span>
              </>
            )}
          </button>
        </form>

        <p className="text-center text-gray-500 text-xs mt-6">
          Zont Technologies Inc.
        </p>
      </div>
    </div>
  );
};

export default ReviewForm;
