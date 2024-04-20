import Header from "@/components/Header";
import DesktopSidebar from "@/components/sidebar/DesktopSidebar";
import MobileSidebar from "@/components/sidebar/MobileSidebar";
import DesktopSideBarToggler from "@/components/sidebar/DesktopSidebarToggler";
import Message from "@/components/Message";
import Conversation from "@/components/Conversation";
import TextInput from "@/components/TextInput";
import styles from "./page.module.css";

export default function Home() {
	return (
		<main className={styles.main}>
			<DesktopSidebar />
			<MobileSidebar />
			<div className={styles.content}>
				<div className={styles.headerChatContainer}>
					<Header />
					<DesktopSideBarToggler />
					<div className={styles.chat}>
						<Message
							role="assistant"
							content={`Hi! I'm your IELTS examiner, here to help you prepare for your test.\nI'm an AI, so mistakes are possible.\n\nPlease select what you'd like to practice:`}
						/>
						<Conversation />
					</div>
				</div>
				<TextInput />
			</div>
		</main>
	);
}
