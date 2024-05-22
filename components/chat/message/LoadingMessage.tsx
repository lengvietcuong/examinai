import React from "react";
import Message from "./Message";
import styles from "./LoadingMessage.module.css";

const LoadingMessage: React.FC = () => {
    return (
        <Message role="assistant">
            <p className={styles.loadingMessage}>
                <span className={styles.dot}></span>
                <span className={styles.dot}></span>
                <span className={styles.dot}></span>
            </p>
        </Message>
    );
}

export default LoadingMessage;