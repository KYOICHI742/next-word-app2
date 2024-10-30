import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function WordSheet() {
  const [user, setUser] = useState(null);
  const [wordList, setWordList] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const wordsPerPage = 10; // 1ページあたりの単語数
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push('/auth'); // ログインしていない場合、ログインページにリダイレクト
      } else {
        setUser(data.session.user);
        fetchWords(data.session.user.id);
      }
    };
    checkUser();
  }, [router]);

  // Supabaseから単語リストを取得
  const fetchWords = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('words')
        .select('*')
        .eq('user_id', userId)
        .order('id'); // ID順で並べ替え

      if (error) throw new Error('単語リストの取得に失敗しました');
      setWordList(data || []);
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  // 現在のページの単語リストを取得
  const getCurrentWords = () => {
    const start = currentPage * wordsPerPage;
    const end = start + wordsPerPage;
    return wordList.slice(start, end);
  };

  // 次のシートへ
  const nextPage = () => {
    if ((currentPage + 1) * wordsPerPage < wordList.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  // 前のシートへ
  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  // ログアウト処理
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/'); // ログアウト後、ホームページにリダイレクト
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
      <h1>単語シート</h1>
      
      {/* エラーメッセージ表示 */}
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

      {/* ナビゲーションボタン */}
      <div style={{ marginBottom: '20px' }}>
        <Link href="/">
          <span style={{
            margin: '10px',
            padding: '10px',
            backgroundColor: 'blue',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}>
            ホームへ
          </span>
        </Link>
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
            単語追加ページへ
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

      {/* 縦長の単語シート */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          rowGap: '10px',
          border: '1px solid #ddd',
          padding: '10px',
          borderRadius: '8px',
        }}
      >
        {getCurrentWords().map((word) => (
          <React.Fragment key={word.id}>
            <div style={{ borderBottom: '1px solid #ddd', padding: '5px' }}>{word.word}</div>
            <div style={{ borderBottom: '1px solid #ddd', padding: '5px' }}>{word.meaning}</div>
          </React.Fragment>
        ))}
      </div>

      {/* ページネーションボタン */}
      <div style={{ marginTop: '20px' }}>
        <button onClick={prevPage} disabled={currentPage === 0} style={{ marginRight: '10px' }}>
          ←
        </button>
        <button onClick={nextPage} disabled={(currentPage + 1) * wordsPerPage >= wordList.length}>
          →
        </button>
      </div>
    </div>
  );
}
