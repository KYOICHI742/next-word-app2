import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function ManageWords() {
  const [user, setUser] = useState(null);
  const [wordList, setWordList] = useState([]);
  const [newWord, setNewWord] = useState('');
  const [newMeaning, setNewMeaning] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push('/');  // 認証されていない場合はホームページへリダイレクト
      } else {
        setUser(data.session.user);
        fetchWords(data.session.user.id);
      }
    };
    checkUser();
  }, [router]);

  const fetchWords = async (userId) => {
    const { data, error } = await supabase.from('words').select('*').eq('user_id', userId);
    if (error) setErrorMessage(`単語リストの取得に失敗しました: ${error.message}`);
    else setWordList(data);
  };

  const handleAddWord = async () => {
    if (!newWord || !newMeaning) {
      setErrorMessage('単語と意味を入力してください');
      return;
    }
    const { error } = await supabase.from('words').insert([{ word: newWord, meaning: newMeaning, user_id: user.id }]);
    if (error) setErrorMessage(`単語の追加に失敗しました: ${error.message}`);
    else {
      setNewWord('');
      setNewMeaning('');
      fetchWords(user.id);
    }
  };

  const handleDeleteWord = async (id) => {
    const { error } = await supabase.from('words').delete().eq('id', id);
    if (error) setErrorMessage(`単語の削除に失敗しました: ${error.message}`);
    else setWordList(wordList.filter((word) => word.id !== id));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');  // ホームページへリダイレクト
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h1>単語管理</h1>

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
            ホームページに戻る
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
            フラッシュカードページへ
          </span>
        </Link>
        <button onClick={handleLogout} style={{
          padding: '10px',
          backgroundColor: 'red',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          margin: '10px'
        }}>
          ログアウト
        </button>
      </div>

      {/* 単語追加機能 */}
      <div>
        <input 
          type="text" 
          placeholder="単語" 
          value={newWord} 
          onChange={(e) => setNewWord(e.target.value)} 
          style={{ margin: '5px', padding: '10px' }} 
        />
        <input 
          type="text" 
          placeholder="意味" 
          value={newMeaning} 
          onChange={(e) => setNewMeaning(e.target.value)} 
          style={{ margin: '5px', padding: '10px' }} 
        />
        <button onClick={handleAddWord} style={{ margin: '5px', padding: '10px' }}>
          追加
        </button>
      </div>

      {/* 単語リスト */}
      <h2>単語リスト</h2>
      {wordList.map((word) => (
        <div key={word.id}>
          <span>{word.word} - {word.meaning}</span>
          <button onClick={() => handleDeleteWord(word.id)} style={{ marginLeft: '10px' }}>削除</button>
        </div>
      ))}
      {errorMessage && <p style={{ color: 'red', marginTop: '10px' }}>{errorMessage}</p>}
    </div>
  );
}
