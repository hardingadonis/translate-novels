'use client';

import { useState } from 'react';

import ChaptersComponent from '@/components/ChaptersComponent';
import HomeComponent from '@/components/HomeComponent';
import LMStudioComponent from '@/components/LMStudioComponent';
import MainLayout from '@/components/MainLayout';
import NovelsComponent from '@/components/NovelsComponent';
import TranslateComponent from '@/components/TranslateComponent';

const HomePage = () => {
	const [activeKey, setActiveKey] = useState('home');

	const renderContent = () => {
		switch (activeKey) {
			case 'home':
				return <HomeComponent onNavigate={setActiveKey} />;
			case 'novels':
				return <NovelsComponent />;
			case 'chapters':
				return <ChaptersComponent />;
			case 'translate':
				return <TranslateComponent />;
			case 'settings':
				return <LMStudioComponent />;
			default:
				return <HomeComponent onNavigate={setActiveKey} />;
		}
	};

	return (
		<MainLayout activeKey={activeKey} onNavigate={setActiveKey}>
			{renderContent()}
		</MainLayout>
	);
};

export default HomePage;
