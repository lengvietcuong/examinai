import React from 'react';
import Image from 'next/image';
import { auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import ProfileIcon from '../icons/ProfileIcon';
import styles from './UserAvatar.module.css';

const UserAvatar: React.FC = () => {
    const [user] = useAuthState(auth);

    return (
        user && user.photoURL ?
            <Image src={user.photoURL} alt="User Avatar" width={40} height={40} className={styles.photoAvatar}/>
            :
            <ProfileIcon className={styles.svgAvatar} />
    );
};

export default UserAvatar;