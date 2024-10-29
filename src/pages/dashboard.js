import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [wordList, setWordList] = useState([]);
  const [newWord, setNewWord] = useState('');
  const [newMeaning, setNewMeaning] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  // ユーザーセッション情報の取得と単語リストの取得
  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          throw new Error('セッション情報の取得に失敗しました。');
        }
        
        if (!data?.session) {
          router.push('/auth');  // ログインしていない場合、ログインページにリダイレクト
        } else {
          setUser(data.session.user);  // ユーザー情報をセット
          await fetchWords(data.session.user.id);  // ユーザーの単語を取得
        }
      } catch (err) {
        setErrorMessage(err.message);
      }
    };
    
    getUserInfo();
  }, [router]);

  // 単語リストを取得する関数
  const fetchWords = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('words')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        throw new Error(`単語リストの取得に失敗しました: ${error.message}`);
      }

      setWordList(data || []);  // データが存在しない場合も対応
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  // 新しい単語を追加する関数
  const handleAddWord = async () => {
    if (!newWord || !newMeaning) {
      setErrorMessage('単語と意味を入力してください');
      return;
    }

    try {
      // 新しい単語をデータベースに挿入
      const { data, error } = await supabase
        .from('words')
        .insert([{ word: newWord, meaning: newMeaning, user_id: user.id }]);

      if (error) {
        throw new Error(`単語の追加に失敗しました: ${error.message}`);
      }

      // フォームフィールドをクリア
      setNewWord('');
      setNewMeaning('');

      // 最新の単語リストを再取得
      if (user) {
        await fetchWords(user.id);  // 単語追加後に最新のリストを取得
      }
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  // 単語を削除する関数
  const handleDeleteWord = async (id) => {
    try {
      const { error } = await supabase
        .from('words')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`単語の削除に失敗しました: ${error.message}`);
      }

      // 削除後のリストを更新
      setWordList((prevList) => prevList.filter((word) => word.id !== id));
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>ダッシュボード</h1>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

      {user && (
        <div>
          <h2>新しい単語を追加</h2>
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

          <h2>単語リスト</h2>
          <ul>
            {wordList.length > 0 ? (
              wordList.map((word) => (
                <li key={word.id}>
                  {word.word} - {word.meaning}
                  <button
                    onClick={() => handleDeleteWord(word.id)}
                    style={{ marginLeft: '10px' }}
                  >
                    削除
                  </button>
                </li>
              ))
            ) : (
              <p>単語がありません。</p>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
