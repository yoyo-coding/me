import Link from "next/link";

export default function NotFound() {
  return (
    <section className="yoyo-content yoyo-notfound">
      <p className="yoyo-notfound-code">404</p>
      <h1 className="yoyo-notfound-title">页面不存在</h1>
      <p className="yoyo-notfound-desc">这里还没有长出内容，或者路径已经改变了。</p>
      <Link href="/" className="yoyo-read-all">
        ← 返回首页
      </Link>
    </section>
  );
}
