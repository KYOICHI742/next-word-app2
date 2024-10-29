import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Flashcards() {
  const [user, setUser] = useState(null);
  const [wordList, setWordList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push('/auth');
      } else {
        setUser(data.session.user);
        fetchWords(data.session.user.id);
      }
    };
    checkUser();
  }, [router]);

  const fetchWords = async (userId) => {
    const { data } = await supabase.from('words').select('*').eq('user_id', userId);
    setWordList(data || []);
  };

  const toggleCard = () => setShowBack(!showBack);
  const nextWord = () => {
    setShowBack(false);
    setCurrentIndex((currentIndex + 1) % wordList.length);
  };
  const prevWord = () => {
    setShowBack(false);
    setCurrentIndex((currentIndex - 1 + wordList.length) % wordList.length);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/'); // ログアウト後、ホームページにリダイレクト
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h1>フラッシュカード</h1>
      {/* ナビゲーションボタン */}
      <div style={{ marginBottom: '20px' }}>
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
            単語管理ページへ
          </span>
        </Link>
        <button onClick={handleLogout} style={{
          padding: '10px',
          backgroundColor: 'red',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginLeft: '10px'
        }}>
          ログアウト
        </button>
      </div>

      {/* フラッシュカードの表示 */}
      {wordList.length > 0 ? (
        <div>
          <button onClick={prevWord}>←</button>
          <div
            onClick={toggleCard}
            style={{
              width: '200px',
              height: '150px',
              backgroundColor: '#e0f7e0',
              margin: '20px auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #ddd',
              borderRadius: '10px',
              cursor: 'pointer',
            }}
          >
            {showBack ? wordList[currentIndex].meaning : wordList[currentIndex].word}
          </div>
          <button onClick={nextWord}>→</button>
        </div>
      ) : (
        <p>単語がありません。</p>
      )}
    </div>
  );
}
