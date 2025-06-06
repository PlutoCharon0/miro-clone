import Image from 'next/image'

const Loading = () => {
	return (
		<div className='h-full w-full flex justify-center items-center'>
			<Image
				priority
				src='/logo.svg'
				alt='Logo'
				width={120}
				height={120}
				className='animate-pulse duration-700'></Image>
		</div>
	)
}

export default Loading
