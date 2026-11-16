import { ChannelPromo } from '../components/ChannelPromo';
import { useI18n, type TKey } from '../i18n';

const SECTIONS: Array<[title: TKey, body: TKey]> = [
  ['about.searchesTitle', 'about.searchesBody'],
  ['about.discoveryTitle', 'about.discoveryBody'],
  ['about.externalTitle', 'about.externalBody'],
  ['about.privacyTitle', 'about.privacyBody'],
  ['about.suggestTitle', 'about.suggestBody'],
];

export function AboutPage() {
  const { t } = useI18n();
  return (
    <div className="page">
      <div className="page-head">
        <h1 className="page-title">{t('about.title')}</h1>
        <p className="lead">{t('about.lead')}</p>
      </div>

      {SECTIONS.map(([title, body]) => (
        <section key={title} className="panel">
          <h2 className="section-title">{t(title)}</h2>
          <p>{t(body)}</p>
        </section>
      ))}

      <ChannelPromo />
    </div>
  );
}
