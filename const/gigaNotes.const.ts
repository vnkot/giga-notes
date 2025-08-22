import { EGigaNotesStatus } from "types";

export const GIGA_NOTES_STATUS_TEXT: Record<EGigaNotesStatus, string> = {
	[EGigaNotesStatus.READY_TO_WORK]:
		`GigaNotes готов к работе`,
	[EGigaNotesStatus.NOT_AUTHORIZED]:
		`GigaNotes не авторизован`,
	[EGigaNotesStatus.IN_PROGRESS]:
		`GigaNotes выполняет запрос`
}

export const GIGA_NOTES_STAUS_ICON: Record<EGigaNotesStatus, string> = {
	[EGigaNotesStatus.READY_TO_WORK]: "✅",
	[EGigaNotesStatus.NOT_AUTHORIZED]: "🔑",
	[EGigaNotesStatus.IN_PROGRESS]: "⏳"
};