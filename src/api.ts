const BASE_URL = 'http://127.0.0.1:8000';

const toChannel = (raw: any) => ({
  id: raw.id,
  name: raw.name,
  description: raw.description,
  icon: raw.icon,
  subscriberCount: raw.subscriber_count,
  isSubscribed: raw.is_subscribed,
  pushEnabled: raw.push_enabled,
});

export const api = {
  getChannels: async () => {
    const res = await fetch(`${BASE_URL}/api/channels/`);
    const data = await res.json();
    return data.map(toChannel);
  },

  getArticles: async () => {
    const res = await fetch(`${BASE_URL}/api/articles/`);
    return res.json();
  },

  getArticle: async (id: string) => {
    const res = await fetch(`${BASE_URL}/api/articles/${id}`);
    return res.json();
  },

  getCards: async () => {
    const res = await fetch(`${BASE_URL}/api/cards/`);
    return res.json();
  },
  getCard: async (id: string) => {
    const res = await fetch(`${BASE_URL}/api/cards/${id}`);
    return res.json();
  },

  getUser: async () => {
    const res = await fetch(`${BASE_URL}/api/users/me`);
    const data = await res.json();
    return {
      ...data,
      isVip: data.is_vip,
      pushTime: data.push_time,
    };
  },
};