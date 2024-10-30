import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Flashcards() {
  const [user, setUser] = useState(null);
  const [wordList, setWordList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
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

  // 単語リストを取得
  const fetchWords = async (userId) => {
    try {
      const { data, error } = await supabase.from('words').select('*').eq('user_id', userId);
      if (error) {
        console.error('単語リストの取得に失敗しました:', error.message);
        throw new Error('単語リストの取得に失敗しました');
      }
      
      console.log("取得した単語データ:", data); // デバッグ用
      setWordList(data || []);
      setCurrentIndex(0); // 最初の単語から表示
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  // カードの表と裏を切り替え
  const toggleCard = () => setShowBack(!showBack);

  // 次の単語へ
  const nextWord = () => {
    if (wordList.length > 0) {
      setShowBack(false);
      setCurrentIndex((currentIndex + 1) % wordList.length);
    }
  };

  // 前の単語へ
  const prevWord = () => {
    if (wordList.length > 0) {
      setShowBack(false);
      setCurrentIndex((currentIndex - 1 + wordList.length) % wordList.length);
    }
  };

  // ログアウト処理
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

      {/* エラーメッセージ表示 */}
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

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
              fontSize: '24px',
              textAlign: 'center',
            }}
          >
            {/* カードに単語または意味を表示 */}
            {(() => {
              const word = wordList[currentIndex];
              return showBack ? word.meaning : word.word;
            })()}
          </div>
          <button onClick={nextWord}>→</button>
        </div>
      ) : (
        <p>単語がありません。</p>
      )}
    </div>
  );
}
