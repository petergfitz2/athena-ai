import AuthCard from '../AuthCard';

export default function AuthCardExample() {
  return (
    <div className="bg-black min-h-screen flex items-center justify-center p-4">
      <AuthCard 
        onLogin={(u, p) => console.log('Login:', u)}
        onRegister={(u, p) => console.log('Register:', u)}
      />
    </div>
  );
}
