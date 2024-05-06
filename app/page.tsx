import Header from "@/components/header/Header";
import DesktopSidebar from "@/components/sidebar/DesktopSidebar";
import MobileSidebar from "@/components/sidebar/MobileSidebar";
import DesktopSideBarToggler from "@/components/sidebar/DesktopSidebarToggler";
import Message from "@/components/message/Message";
import SkillSelection from "@/components/SkillSelection";
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
						<Message role="assistant">
							<p>{`Hi! I'm your IELTS examiner, here to help you prepare for your test.\nI'm an imperfect AI, so mistakes are possible.\n\nPlease select what you'd like to practice:`}</p>
							<SkillSelection />
						</Message>
						<Conversation />
					</div>
				</div>
				<TextInput />
			</div>
		</main>
	);
}
