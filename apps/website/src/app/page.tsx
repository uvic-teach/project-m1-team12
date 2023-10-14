import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';

interface HomeButtonProps {
  to: string;
  title: string;
}

export default function Home() {
  return (
    <main className="w-screen h-screen p-4 md:px-24 md:py-12 bg-orange-100">
      <div className="grid grid-cols-2 gap-4 md:gap-8 h-full w-full">
        <HomeButton to='/menu' title='Menu' />
        <HomeButton to='/emergency' title='Emergency' />
        <HomeButton to='/calendar' title='Calendar' />
        <HomeButton to='/messaging' title='Messaging' />
      </div>
    </main>
  )
}

const HomeButton = ({to, title}: HomeButtonProps) => {
  return (
    <Link href={to} underline="none" className='h-full'>
      <Card className={`w-full h-full flex grid items-center ${title === "Emergency" && "bg-red-200 border-red-400 border-2 text-red-900"}`}>
        <Typography className="text-center text-2xl">{title}</Typography>
      </Card>
    </Link>
  )
}