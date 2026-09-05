import { useLocale } from './locale';
import snapshot from './qiita-likes.json';

export function QiitaLikes({ id }: { id: string }) {
  const { t, en } = useLocale();
  const count = (snapshot.likes as Record<string, number>)[id];
  const date = snapshot.fetchedAt as string | null;
  const updated = date
    ? new Intl.DateTimeFormat(en ? 'en-US' : 'ja-JP', {
        timeZone: 'Asia/Tokyo',
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(new Date(date))
    : '';
  return (
    <span
      className="qiita-likes"
      title={
        updated
          ? t(
              `Qiitaのいいね数 · ${updated}取得（リアルタイムではありません）`,
              `Qiita likes · Retrieved ${updated} (not live)`,
            )
          : t('Qiitaのいいね数は未取得です', 'Qiita likes unavailable')
      }
    >
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M12 20 3.7 12A5.2 5.2 0 0 1 12 5.8 5.2 5.2 0 0 1 20.3 12Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
      {count === undefined
        ? t('いいね —', 'Likes —')
        : `${count.toLocaleString(en ? 'en-US' : 'ja-JP')} ${t('いいね', 'likes')}`}
    </span>
  );
}

export function LikesUpdated() {
  const { t, en } = useLocale();
  const date = snapshot.fetchedAt as string | null;
  return (
    <p className="likes-updated">
      {t('いいね数：', 'Likes: ')}
      {date ? (
        <>
          <time dateTime={date}>
            {new Intl.DateTimeFormat(en ? 'en-US' : 'ja-JP', {
              timeZone: 'Asia/Tokyo',
              dateStyle: 'short',
              timeStyle: 'short',
            }).format(new Date(date))}
          </time>{' '}
          {t('時点のQiita公開データ', ' · Qiita public data snapshot')}
        </>
      ) : (
        t('未取得', 'unavailable')
      )}
    </p>
  );
}
