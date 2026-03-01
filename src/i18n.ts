import {getRequestConfig} from 'next-intl/server';
import {en, ne} from './locales';

export default getRequestConfig(async ({requestLocale}) => {
  let locale = await requestLocale;

  if (!locale || !['en', 'ne'].includes(locale)) {
    locale = 'en';
  }

  return {
    locale,
    messages: locale === 'en' ? en : ne
  };
});
