import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Message from "@/components/Message";
import Conversation from "@/components/Conversation";
import TextInput from "@/components/TextInput";
import styles from "./page.module.css";

export default function Home() {
	return (
		<main className={styles.main}>
			<Sidebar/>
			<div className={styles.content}>
				<div className={styles.headerChatContainer}>
					<Header />
					<div className={styles.chat}>
						<Message
							sender="Examinai"
							content={`Hi! I'm your IELTS examiner, here to help you prepare for your test.
							I'm powered by AI, so mistakes are possible.
							
							To get started, select the skill you'd like to practice:`}
						/>
						<Conversation />
					</div>
				</div>
				<TextInput />
			</div>
		</main>
	);
}
