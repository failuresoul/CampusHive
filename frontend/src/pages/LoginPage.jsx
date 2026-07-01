import React from 'react';
import { GraduationCap } from 'lucide-react';
import LoginForm from '../components/auth/LoginForm';

const LoginPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center animate-slide-up">
        <div className="mx-auto h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-md border border-primary-100 mb-4">
          <GraduationCap className="h-8 w-8 text-primary-600" />
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          CampusHive
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in to access your portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md animate-fade-in">
        <div className="bg-white/80 backdrop-blur-md py-8 px-4 shadow-xl shadow-primary-200/50 sm:rounded-2xl sm:px-10 border border-white">
          <LoginForm />
        </div>
        
        <p className="mt-8 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Campus Management System. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
