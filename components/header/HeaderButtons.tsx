'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { auth } from '@/lib/firebase';
import { User } from 'firebase/auth';
import PlusIcon from '../icons/PlusIcon';
import ProfileIcon from '../icons/ProfileIcon';
import HamburgerMenuIcon from '../icons/HamburgerMenuIcon';
import SignOutIcon from '../icons/SignOutIcon';
import useSidebarStore from '@/stores/sidebarStore';
import useConversationStore from '@/stores/conversationStore';
import useUserMessageStore from '@/stores/userMessageStore';
import useSkillStore from '@/stores/skillStore';
import { montserrat } from '@/fonts/fonts';
import styles from './HeaderButtons.module.css';

const HeaderButtons: React.FC = () => {
    const setIsOpenMobile = useSidebarStore((state) => state.setIsOpenMobile);
    const [user, loading] = useAuthState(auth);
    const profileAreaRef = useRef<HTMLDivElement>(null);
    const [showSignOutButton, setShowSignOutButton] = useState(false);
    const { setMessages, setConversationId } = useConversationStore((state) => ({ setMessages: state.setMessages, setConversationId: state.setConversationId }));
    const setSelectedSkill = useSkillStore((state) => state.setSelectedSkill);
    const setUserMessage = useUserMessageStore((state) => state.setUserMessage);

    const toggleSignOutButtonVisibility = () => {
        setShowSignOutButton(!showSignOutButton);
    };

    const renderSignInButton = () => (
        <button
            onClick={async () => await signInWithPopup(auth, new GoogleAuthProvider())}
            className={`${styles.signInButton} ${styles.buttonContainer}`}
        >
            <ProfileIcon className={styles.buttonIcon} />
            <span className={`${styles.buttonText} ${montserrat.className}`}>Sign in</span>
        </button>
    );

    const renderUserAvatar = (user: User) => (
        user.photoURL ?
            (<button
                onClick={toggleSignOutButtonVisibility}
                className={`${styles.buttonContainer} ${styles.userAvatarButton}`}
            >
                <Image src={user.photoURL} alt="User Avatar" className={styles.userAvatar} width={40} height={40} />
            </button>)
            :
            (<button
                onClick={toggleSignOutButtonVisibility}
                className={`${styles.buttonContainer} ${styles.placeholderAvatarButton}`}
            >
                <ProfileIcon className={styles.placeholderAvatar} />
            </button>)
    );

    const renderSignOutButton = () => (
        <>
            <button
                onClick={async () => {
                    await signOut(auth);
                    window.location.reload();
                }}
                className={`${styles.buttonContainer} ${styles.signOutButton}`}
            >
                <SignOutIcon className={styles.buttonIcon} />
                <span className={`${styles.buttonText} ${montserrat.className}`}>Sign out</span>
            </button>
            <div className={styles.overlay} onClick={toggleSignOutButtonVisibility} />
        </>
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                profileAreaRef.current &&
                !profileAreaRef.current.contains(event.target as Node)
            ) {
                setShowSignOutButton(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <>
            <button className={`${styles.buttonContainer} ${styles.hamburgerMenuButton}`} onClick={() => setIsOpenMobile(true)}>
                <HamburgerMenuIcon className={styles.buttonIcon} />
            </button>
            <button
                className={`${styles.buttonContainer} ${styles.newChatButton}`}
                onClick={() => {
                    setConversationId(null);
                    setSelectedSkill(null);
                    setMessages(() => []);
                    setUserMessage(null);
                }}
            >
                <PlusIcon className={styles.buttonIcon} />
                <span className={`${styles.buttonText} ${montserrat.className}`}>New chat</span>
            </button>
            {!loading &&
                (user ?
                    (<div ref={profileAreaRef} className={styles.profileArea}>
                        {renderUserAvatar(user)}
                        {showSignOutButton && renderSignOutButton()}
                    </div >)
                    :
                    // Do not render sign in button if sign out button is still there (page not refreshed yet) 
                    (!showSignOutButton ? renderSignInButton() : null)
                )
            }
        </>
    );
};

export default HeaderButtons;