import Link from "next/link";
import { getFriendLinks } from "@/lib/friends";

/** 友情链接卡片网格（服务端构建时从 friends-data 仓库拉取）。标题由 About 页提供 */
export async function FriendLinksSection() {
  const friends = await getFriendLinks();

  return (
    <>
      {friends.length === 0 ? (
        <p className="yoyo-about-text-muted">
          暂无友链。想和我交换友链？请查看页脚的「申请友链」。
        </p>
      ) : (
        <ul className="yoyo-friend-grid">
          {friends.map((friend) => (
            <li key={friend.url}>
              <a
                href={friend.url}
                className="yoyo-friend-card"
                target="_blank"
                rel="noopener noreferrer"
              >
                {friend.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={friend.avatar}
                    alt={`${friend.name} 头像`}
                    className="yoyo-friend-avatar"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="yoyo-friend-avatar yoyo-friend-avatar-fallback" aria-hidden="true">
                    {friend.name.slice(0, 1)}
                  </span>
                )}
                <span className="yoyo-friend-info">
                  <span className="yoyo-friend-name">{friend.name}</span>
                  {friend.description && (
                    <span className="yoyo-friend-desc">{friend.description}</span>
                  )}
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
      <p className="yoyo-friend-apply">
        想交换友链？<Link href="/#apply-friend" className="yoyo-friend-apply-link">查看申请方式 →</Link>
      </p>
    </>
  );
}
