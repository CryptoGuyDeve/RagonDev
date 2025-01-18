import Image from 'next/image';
import React, { useContext } from 'react';
import { Button } from '../ui/button';
import Colors from '@/data/Colors';
import { UserDetailContext } from '@/context/UserDetailContext';

function Header() {
  const { userDetail } = useContext(UserDetailContext);

  return (
    <div className='p-4 flex justify-between items-center'>
      <Image src={'/logo.png'} alt='Logo' width={50} height={50} />
      {!userDetail?.name && ( // Use optional chaining to avoid accessing 'name' on null or undefined
        <div className="flex gap-5">
          <Button variant="ghost">Sign In</Button>
          <Button
            className="text-white"
            style={{
              background: Colors.BLUE,
            }}
          >
            Get Started
          </Button>
        </div>
      )}
    </div>
  );
}

export default Header;
