import Image from 'next/image'

export default function LoginImage() {
	return (
		<div className="relative size-full overflow-hidden rounded-xl">
			<Image
				alt="test"
				src="/images/bg-2.png"
				fill
				className="object-cover object-top"
			/>
		</div>
	)
}
