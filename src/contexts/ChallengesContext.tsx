import { createContext, useState, ReactNode, useEffect } from 'react';
import Cookies from 'js-cookie';
import challenges from '../../challenges.json';
import { LevelUpModal } from '../components/LevelUpModal';


interface Challenge {
    type: 'body' | 'eye';
    description: string;
    amount: number;
}

interface ChallengesContextData {
    level: number;
    currentExperience: number;
    challengesCompleted: number;
    experienceToNextLevel: number;
    activeChallenge: Challenge;
    levelUp: () => void;
    startNewChallenge: () => void;
    resetChallenge: () => void;
    completeChallenge: () => void;
    closeLevelUpModal: () => void;

}

// type e interface aqui no caso fazem a mesma coisa
interface ChallengesProviderProps {
    children: ReactNode;
    level: number;
    currentExperience: number;
    challengesCompleted: number;
}

export const ChallengesContext = createContext({} as ChallengesContextData);

let countdownTimeout: NodeJS.Timeout;

export function ChallengesProvider({
    children,
    ...rest
}: ChallengesProviderProps) {

    const [level, setLevel] = useState(rest.level ?? 1);
    const [currentExperience, setCurrentExperience] = useState(rest.currentExperience ?? 0);
    const [challengesCompleted, setChallengesCompleted] = useState(rest.challengesCompleted ?? 0);

    const [activeChallenge, setActiveChallenge] = useState(null)

    const [isLevelUpModalOpen, setisLevelUpModalOpen] = useState(false);

    //Math.pow utilizado para cáculos de POTÊNCIA
    const experienceToNextLevel = Math.pow((level + 1) * 4, 2)

    //Use Effect com um array vazio significa que a primeira função será
    //executada um única vez assim que esse elemento for exibido em tela
    useEffect(() => {
        Notification.requestPermission();
    }, [])

    //Notification.requestPermission(); é a API do próprio browser para
    //pedir permissão para o envio de notificações

    useEffect(() => {
        Cookies.set('level', String(level));
        Cookies.set('currentExperience', String(currentExperience));
        Cookies.set('challengesCompleted', String(challengesCompleted));
    }, [level, currentExperience, challengesCompleted]);

    function levelUp() {
        setLevel(level + 1);
        setisLevelUpModalOpen(true);
    }

    function closeLevelUpModal() {
        setisLevelUpModalOpen(false);
    }

    function startNewChallenge() {
        //Math.floor -> está escolhendo um número arredondado para baixo
        //Floor serve apra arredondar um valor para baixo
        const randomChallengeIndex = Math.floor(Math.random() * challenges.length)
        const challenge = challenges[randomChallengeIndex];

        setActiveChallenge(challenge)

        new Audio('/notification.mp3').play();

        if (Notification.permission === 'granted') {
            new Notification('Novo desafio 🙂', {
                body: `Valendo ${challenge.amount} Xp!`
            })
        }
    }

    function resetChallenge() {
        setActiveChallenge(null);
    }

    function completeChallenge() {
        if (!activeChallenge) {
            return;
        }

        const { amount } = activeChallenge;

        let finalExperience = currentExperience + amount;

        if (finalExperience >= experienceToNextLevel) {
            finalExperience = finalExperience - experienceToNextLevel;
            levelUp();
        }

        setCurrentExperience(finalExperience);
        setActiveChallenge(null);
        setChallengesCompleted(challengesCompleted + 1);
    }

    // RETURNS 
    return (
        <ChallengesContext.Provider value={{
            level,
            currentExperience,
            challengesCompleted,
            levelUp,
            startNewChallenge,
            activeChallenge,
            resetChallenge,
            experienceToNextLevel,
            completeChallenge,
            closeLevelUpModal
        }}>
            {children}

            { isLevelUpModalOpen && <LevelUpModal />}

        </ChallengesContext.Provider>
    )

}



