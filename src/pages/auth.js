import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSignUp, setIsSignUp] = useState(false); // 新規登録モードかログインモードか
  const router = useRouter();

  // ログイン処理
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setErrorMessage(error.message);
    } else {
      router.push('/');  // ログイン後にホームページへリダイレクト
    }
  };

  // 新規登録処理
  const handleSignUp = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setErrorMessage(error.message);
    } else {
      router.push('/');  // 新規登録後にホームページへリダイレクト
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>{isSignUp ? '新規登録' : 'ログイン'}</h1>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setIsSignUp(false)} style={{ marginRight: '10px', padding: '10px' }}>
          ログイン
        </button>
        <button onClick={() => setIsSignUp(true)} style={{ padding: '10px' }}>
          新規登録
        </button>
      </div>
      <input 
        type="email" 
        placeholder="Email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        style={{ display: 'block', margin: '10px auto', padding: '10px' }} 
      />
      <input 
        type="password" 
        placeholder="Password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        style={{ display: 'block', margin: '10px auto', padding: '10px' }} 
      />
      {isSignUp ? (
        <button onClick={handleSignUp} style={{ padding: '10px', marginTop: '10px' }}>新規登録</button>
      ) : (
        <button onClick={handleLogin} style={{ padding: '10px', marginTop: '10px' }}>ログイン</button>
      )}
      {errorMessage && <p style={{ color: 'red', marginTop: '10px' }}>{errorMessage}</p>}
    </div>
  );
}
