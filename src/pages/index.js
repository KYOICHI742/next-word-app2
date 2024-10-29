import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Home() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // ユーザーのセッションを確認
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        setUser(data.session.user);
      }
    };
    checkUser();
  }, []);

  // ログアウト機能
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null); // ログアウト後にユーザー情報をクリア
    router.push('/'); // ホームページにリダイレクト
  };

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>英単語学習アプリへようこそ！</h1>
      <p>このアプリを使用して、あなたの英単語リストを作成・管理できます。</p>

      <div style={{ marginTop: '20px' }}>
        {/* ユーザーがログインしていない場合 */}
        {!user ? (
          <Link href="/auth">
            <span style={{ 
              margin: '10px', 
              padding: '10px', 
              backgroundColor: 'blue', 
              color: 'white', 
              textDecoration: 'none', 
              borderRadius: '5px', 
              cursor: 'pointer' 
            }}>
              ログイン / 新規登録
            </span>
          </Link>
        ) : (
          // ユーザーがログインしている場合
          <div>
            <div style={{ margin: '20px' }}>
              <Link href="/manage">
                <span style={{
                  margin: '10px',
                  padding: '10px',
                  backgroundColor: 'green',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}>
                  単語管理ページ
                </span>
              </Link>
              <Link href="/flashcards">
                <span style={{
                  margin: '10px',
                  padding: '10px',
                  backgroundColor: 'purple',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}>
                  フラッシュカードページ
                </span>
              </Link>
            </div>
            <button 
              onClick={handleLogout} 
              style={{ 
                padding: '10px', 
                backgroundColor: 'red', 
                color: 'white', 
                border: 'none', 
                borderRadius: '5px', 
                cursor: 'pointer' 
              }}>
              ログアウト
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
