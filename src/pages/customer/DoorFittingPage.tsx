import React from 'react';
import { BuildYourDoorPage } from './BuildYourDoorPage';

interface DoorFittingPageProps {
  navigate: (path: string) => void;
}

export const DoorFittingPage: React.FC<DoorFittingPageProps> = ({ navigate }) => {
  return <BuildYourDoorPage navigate={navigate} />;
};
