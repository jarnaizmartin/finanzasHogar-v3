import { useState, useRef, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, ChevronDown, ChevronRight } from 'lucide-react';
import { getFaqCategories } from '../../lib/helpCenterData';

interface Props {
  T: any;
}

export function HelpFAQView({ T }: Props) {
  const { t } = useTranslation();
  const [faqSearch, setFaqSearch] = useState('');
  const [faqCategory, setFaqCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const FAQ_CATEGORIES = getFaqCategories();

  useEffect(() => {
    const timer = setTimeout(() => searchRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, []);

  const filteredFAQ = useMemo(() => {
    const q = faqSearch.toLowerCase();
    return FAQ_CATEGORIES.filter(
      (cat) => faqCategory === 'all' || cat.id === faqCategory
    )
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (item) =>
            !q ||
            item.question.toLowerCase().includes(q) ||
            item.answer.toLowerCase().includes(q) ||
            item.tags.some((t) => t.includes(q))
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [faqSearch, faqCategory]);

  const totalResults = filteredFAQ.reduce((s, c) => s + c.items.length, 0);

  return (
    <div>
      {/* Buscador */}
      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <Search
          size={16}
          color={T.muted}
          style={{
            position: 'absolute',
            left: '0.875rem',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
          }}
        />
        <input
          ref={searchRef}
          type="text"
          placeholder={t('misc.helpFaq.searchPlaceholder')}
          value={faqSearch}
          onChange={(e) => setFaqSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem 0.875rem 0.75rem 2.5rem',
            borderRadius: '0.875rem',
            border: `1.5px solid ${faqSearch ? T.accent : T.inputBorder}`,
            background: T.inputBg,
            color: T.inputText,
            fontSize: '0.875rem',
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color 0.15s',
          }}
        />
        {faqSearch && (
          <button
            onClick={() => setFaqSearch('')}
            style={{
              position: 'absolute',
              right: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: T.muted,
              fontSize: '0.8rem',
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Filtro por categoría */}
      <div
        style={{
          display: 'flex',
          gap: '0.375rem',
          flexWrap: 'wrap',
          marginBottom: '1.25rem',
        }}
      >
        <button
          onClick={() => setFaqCategory('all')}
          style={{
            padding: '0.35rem 0.75rem',
            borderRadius: '9999px',
            border:
              faqCategory === 'all' ? 'none' : `1px solid ${T.cardBorder}`,
            background: faqCategory === 'all' ? T.accent : T.pageBg,
            color: faqCategory === 'all' ? '#fff' : T.muted,
            fontSize: '0.72rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {t('misc.helpFaq.allCategory')}
        </button>
        {FAQ_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() =>
              setFaqCategory(faqCategory === cat.id ? 'all' : cat.id)
            }
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '9999px',
              border:
                faqCategory === cat.id ? 'none' : `1px solid ${T.cardBorder}`,
              background: faqCategory === cat.id ? cat.color : T.pageBg,
              color: faqCategory === cat.id ? '#fff' : T.muted,
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* Contador de resultados */}
      {faqSearch && (
        <div
          style={{
            fontSize: '0.72rem',
            color: T.muted,
            marginBottom: '0.875rem',
            padding: '0.5rem 0.75rem',
            borderRadius: '0.5rem',
            background: T.accentLight,
            border: `1px solid ${T.accent}33`,
          }}
        >
          {totalResults === 1
            ? t('misc.helpFaq.results1', { count: totalResults, query: faqSearch })
            : t('misc.helpFaq.resultsN', { count: totalResults, query: faqSearch })}
        </div>
      )}

      {/* Lista de preguntas */}
      {filteredFAQ.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            color: T.muted,
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
          <div
            style={{ fontSize: '0.875rem', fontWeight: 700, color: T.title }}
          >
            {t('misc.helpFaq.noResults')}
          </div>
          <div style={{ fontSize: '0.775rem', marginTop: '0.25rem' }}>
            {t('misc.helpFaq.noResultsHint')}
          </div>
        </div>
      ) : (
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
        >
          {filteredFAQ.map((cat) => (
            <div key={cat.id}>
              {/* Cabecera categoría */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.625rem',
                  paddingBottom: '0.5rem',
                  borderBottom: `2px solid ${cat.color}33`,
                }}
              >
                <span style={{ fontSize: '1rem' }}>{cat.emoji}</span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: cat.color,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  {cat.label}
                </span>
                <span
                  style={{
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    padding: '0.1rem 0.4rem',
                    borderRadius: '9999px',
                    background: cat.color + '18',
                    color: cat.color,
                  }}
                >
                  {cat.items.length}
                </span>
              </div>

              {/* Preguntas */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.375rem',
                }}
              >
                {cat.items.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      borderRadius: '0.875rem',
                      border: `1px solid ${
                        expandedFAQ === item.id
                          ? cat.color + '44'
                          : T.cardBorder
                      }`,
                      background:
                        expandedFAQ === item.id ? cat.color + '08' : T.pageBg,
                      overflow: 'hidden',
                      transition: 'all 0.15s',
                    }}
                  >
                    <button
                      onClick={() =>
                        setExpandedFAQ(expandedFAQ === item.id ? null : item.id)
                      }
                      style={{
                        width: '100%',
                        padding: '0.875rem 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.825rem',
                          fontWeight: 700,
                          color: expandedFAQ === item.id ? cat.color : T.title,
                          flex: 1,
                          lineHeight: 1.4,
                        }}
                      >
                        {item.question}
                      </span>
                      {expandedFAQ === item.id ? (
                        <ChevronDown
                          size={14}
                          color={cat.color}
                          style={{ flexShrink: 0 }}
                        />
                      ) : (
                        <ChevronRight
                          size={14}
                          color={T.muted}
                          style={{ flexShrink: 0 }}
                        />
                      )}
                    </button>
                    {expandedFAQ === item.id && (
                      <div
                        style={{
                          padding: '0 1rem 1rem',
                          animation: 'fadeSlideIn 0.15s ease both',
                        }}
                      >
                        <div
                          style={{
                            height: '1px',
                            background: cat.color + '22',
                            marginBottom: '0.875rem',
                          }}
                        />
                        <p
                          style={{
                            fontSize: '0.825rem',
                            color: T.body,
                            lineHeight: 1.7,
                            margin: 0,
                          }}
                        >
                          {item.answer}
                        </p>
                        {/* Tags */}
                        <div
                          style={{
                            display: 'flex',
                            gap: '0.375rem',
                            flexWrap: 'wrap',
                            marginTop: '0.75rem',
                          }}
                        >
                          {item.tags.map((tag) => (
                            <span
                              key={tag}
                              onClick={() => {
                                setFaqSearch(tag);
                                setExpandedFAQ(null);
                              }}
                              style={{
                                fontSize: '0.62rem',
                                fontWeight: 600,
                                padding: '0.15rem 0.5rem',
                                borderRadius: '9999px',
                                background: T.cardBg,
                                border: `1px solid ${T.cardBorder}`,
                                color: T.muted,
                                cursor: 'pointer',
                              }}
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
