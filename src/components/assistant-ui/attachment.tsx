'use client'

import { PropsWithChildren, useEffect, useState } from 'react'
import Image from 'next/image'
import {
	AttachmentPrimitive,
	ComposerPrimitive,
	MessagePrimitive,
	useAssistantApi,
	useAssistantState,
} from '@assistant-ui/react'
import { FileText, PlusIcon, XIcon } from 'lucide-react'
import { useShallow } from 'zustand/shallow'

import { TooltipIconButton } from '~/components/assistant-ui/tooltip-icon-button'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '~/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'
import { cn } from '~/lib/utils'

function useFileSrc(file: File | undefined) {
	const [src, setSrc] = useState<string | undefined>(undefined)

	useEffect(() => {
		if (!file) {
			setSrc(undefined)

			return
		}

		const objectUrl = URL.createObjectURL(file)
		setSrc(objectUrl)

		return () => {
			URL.revokeObjectURL(objectUrl)
		}
	}, [file])

	return src
}

function useAttachmentSrc() {
	const { file, src } = useAssistantState(
		useShallow(({ attachment }): { file?: File; src?: string } => {
			if (attachment.type !== 'image') return {}
			if (attachment.file) return { file: attachment.file }
			const src = attachment.content?.filter((c) => c.type === 'image')[0]?.image
			if (!src) return {}

			return { src }
		}),
	)

	return useFileSrc(file) ?? src
}

type AttachmentPreviewProps = {
	src: string
}

function AttachmentPreview({ src }: AttachmentPreviewProps) {
	const [isLoaded, setIsLoaded] = useState(false)

	return (
		<Image
			src={src}
			alt="Image Preview"
			width={1}
			height={1}
			className={
				isLoaded
					? 'aui-attachment-preview-image-loaded block h-auto max-h-[80vh] w-auto max-w-full object-contain'
					: 'aui-attachment-preview-image-loading hidden'
			}
			onLoadingComplete={() => {
				setIsLoaded(true)
			}}
			priority={false}
		/>
	)
}

function AttachmentPreviewDialog({ children }: PropsWithChildren) {
	const src = useAttachmentSrc()

	if (!src) return children

	return (
		<Dialog>
			<DialogTrigger
				className="aui-attachment-preview-trigger hover:bg-accent/50 cursor-pointer transition-colors"
				asChild
			>
				{children}
			</DialogTrigger>
			<DialogContent className="aui-attachment-preview-dialog-content [&_svg]:text-background [&>button]:bg-foreground/60 [&>button]:hover:[&_svg]:text-destructive p-2 sm:max-w-3xl [&>button]:rounded-full [&>button]:p-1 [&>button]:opacity-100 [&>button]:!ring-0">
				<DialogTitle className="aui-sr-only sr-only">{'Image Attachment Preview'}</DialogTitle>
				<div className="aui-attachment-preview bg-background relative mx-auto flex max-h-[80dvh] w-full items-center justify-center overflow-hidden">
					<AttachmentPreview src={src} />
				</div>
			</DialogContent>
		</Dialog>
	)
}

function AttachmentThumb() {
	const isImage = useAssistantState(({ attachment }) => attachment.type === 'image')
	const src = useAttachmentSrc()

	return (
		<Avatar className="aui-attachment-tile-avatar h-full w-full rounded-none">
			<AvatarImage
				src={src}
				alt="Attachment preview"
				className="aui-attachment-tile-image object-cover"
			/>
			<AvatarFallback delayMs={isImage ? 200 : 0}>
				<FileText className="aui-attachment-tile-fallback-icon text-muted-foreground size-8" />
			</AvatarFallback>
		</Avatar>
	)
}

function AttachmentUI() {
	const api = useAssistantApi()
	const isComposer = api.attachment.source === 'composer'

	const isImage = useAssistantState(({ attachment }) => attachment.type === 'image')
	const typeLabel = useAssistantState(({ attachment }) => {
		const type = attachment.type
		switch (type) {
			case 'image': {
				return 'Image'
			}
			case 'document': {
				return 'Document'
			}
			case 'file': {
				return 'File'
			}
			default: {
				return 'Attachment'
			}
		}
	})

	return (
		<Tooltip>
			<AttachmentPrimitive.Root
				className={cn(
					'aui-attachment-root relative',
					isImage && 'aui-attachment-root-composer only:[&>#attachment-tile]:size-24',
				)}
			>
				<AttachmentPreviewDialog>
					<TooltipTrigger asChild>
						<div
							className={cn(
								'aui-attachment-tile bg-muted size-14 cursor-pointer overflow-hidden rounded-[14px] border transition-opacity hover:opacity-75',
								isComposer && 'aui-attachment-tile-composer border-foreground/20',
							)}
							role="button"
							id="attachment-tile"
							aria-label={`${typeLabel} attachment`}
						>
							<AttachmentThumb />
						</div>
					</TooltipTrigger>
				</AttachmentPreviewDialog>
				{isComposer && <AttachmentRemove />}
			</AttachmentPrimitive.Root>
			<TooltipContent side="top">
				<AttachmentPrimitive.Name />
			</TooltipContent>
		</Tooltip>
	)
}

function AttachmentRemove() {
	return (
		<AttachmentPrimitive.Remove asChild>
			<TooltipIconButton
				tooltip="Remove file"
				className="aui-attachment-tile-remove text-muted-foreground hover:[&_svg]:text-destructive absolute top-1.5 right-1.5 size-3.5 rounded-full bg-white opacity-100 shadow-sm hover:!bg-white [&_svg]:text-black"
				side="top"
			>
				<XIcon className="aui-attachment-remove-icon size-3 dark:stroke-[2.5px]" />
			</TooltipIconButton>
		</AttachmentPrimitive.Remove>
	)
}

export function UserMessageAttachments() {
	return (
		<div className="aui-user-message-attachments-end col-span-full col-start-1 row-start-1 flex w-full flex-row justify-end gap-2">
			<MessagePrimitive.Attachments components={{ Attachment: AttachmentUI }} />
		</div>
	)
}

export function ComposerAttachments() {
	return (
		<div className="aui-composer-attachments mb-2 flex w-full flex-row items-center gap-2 overflow-x-auto px-1.5 pt-0.5 pb-1 empty:hidden">
			<ComposerPrimitive.Attachments components={{ Attachment: AttachmentUI }} />
		</div>
	)
}

export function ComposerAddAttachment() {
	return (
		<ComposerPrimitive.AddAttachment asChild>
			<TooltipIconButton
				tooltip="Add Attachment"
				side="bottom"
				variant="ghost"
				size="icon"
				className="aui-composer-add-attachment hover:bg-muted-foreground/15 dark:border-muted-foreground/15 dark:hover:bg-muted-foreground/30 size-[34px] rounded-full p-1 text-xs font-semibold"
				aria-label="Add Attachment"
			>
				<PlusIcon className="aui-attachment-add-icon size-5 stroke-[1.5px]" />
			</TooltipIconButton>
		</ComposerPrimitive.AddAttachment>
	)
}
