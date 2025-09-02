import Image from 'next/image'

export default function SignupImage() {
	return (
		<div className="relative size-full overflow-hidden rounded-xl">
			<Image
				alt="test"
				src="/images/signup-bg.png"
				fill
				className="object-cover object-bottom"
			/>
		</div>
	)
}
