import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import BecomeContractorClient from './BecomeContractorClient';

export default async function BecomeContractorPage() {
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <BecomeContractorClient />
    </NextIntlClientProvider>
  );
}
