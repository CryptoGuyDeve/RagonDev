'use client'

import { MessagesContext } from '@/context/MessagesContext';
import { UserDetailContext } from '@/context/UserDetailContext';
import { api } from '@/convex/_generated/api';
import Colors from '@/data/Colors';
import Lookup from '@/data/Lookup';
import Prompt from '@/data/Prompt';
import axios from 'axios';
import { useConvex, useMutation } from 'convex/react';
import { ArrowRight, Link, Loader2Icon } from 'lucide-react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import React, { useContext, useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { useSidebar } from '../ui/sidebar';

export const countToken = (inputText) => {
    return inputText.trim().split(/\s+/).filter(word => word).length;
}

function ChatView() {
    const {id} = useParams();
    const convex = useConvex();
    const {userDetail} = useContext(UserDetailContext);
    const {messages, setMessages} = useContext(MessagesContext);
    const [userInput, setUserInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [lastUserMessage, setLastUserMessage] = useState(null); // Track last user message
    const UpdateMessage = useMutation(api.workspace.UpdateMessage);
    const {toggleSidebar}=useSidebar();
    const UpdateTokens=useMutation(api.users.UpdateToken);

    useEffect(() => {
        id && GetWorkspaceData();
    }, [id]);

    // Get Workspace Data
    const GetWorkspaceData = async () => {
        const result = await convex.query(api.workspace.GetWorkspace, {
            workspaceId: id
        });
        setMessages(result?.messages);
    };

    useEffect(() => {
        if (messages?.length > 0) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.role === 'user' && lastMessage !== lastUserMessage) {
                setLastUserMessage(lastMessage);
                GetAiResponse();
            }
        }
    }, [messages]);

    const GetAiResponse = async () => {
        setLoading(true);
        const PROMPT = JSON.stringify(messages) + Prompt.CHAT_PROMPT;

        try {
            const result = await axios.post('/api/ai-chat', {
                prompt: PROMPT
            });

            const aiResp = {
                role: 'ai',
                context: result.data.result,
            };

            setMessages(prev => [...prev, aiResp]);

            await UpdateMessage({
                messages: [...messages, aiResp],
                workspaceId: id
            });

            const token=Number(userDetail?.token)-Number(countToken(JSON.stringify(aiResp)));
            //Update Tokens in Database
            await UpdateTokens({
                userId:userDetail?._id,
                token:token
            })
        } catch (error) {
            console.error('Error generating AI response:', error);
        } finally {
            setLoading(false);
        }
    };

    const onGenerate = (input) => {
        setMessages(prev => [...prev, {
            role: 'user',
            context: input
        }]);
        setUserInput('');
    };

    return (
        <div className='relative h-[85vh] flex flex-col'>
            <div className='flex-1 overflow-y-scroll scrollbar-hide px-5'>
                {messages?.map((msg, index) => (
                    <div key={index} 
                        className='p-3 rounded-lg mb-2 flex gap-2 items-start leading-7'
                        style={{
                            backgroundColor: Colors.CHAT_BACKGROUND
                        }}>
                        {msg?.role === 'user' && <Image src={userDetail?.picture} alt='userImage' width={35} height={35} className='rounded-full' />}
                        <ReactMarkdown className='flex flex-col'>{msg.context}</ReactMarkdown>
                    </div>
                ))}
                {loading && 
                <div className='p-3 rounded-lg mb-2 flex gap-2 items-start' 
                    style={{
                        backgroundColor: Colors.CHAT_BACKGROUND
                    }}>
                    <Loader2Icon className='animate-spin' />
                    <h2>Generating response...</h2>
                </div>
                }
            </div>

            {/* Input Section */}
            <div className='flex gap-2 items-end'>
                {userDetail&&  <Image src={userDetail?.picture} className='rounded-full cursor-pointer' onClick={toggleSidebar} alt='user' width={30} height={30} />}
            <div
                className='p-5 border rounded-xl max-w-xl w-full mt-3'
                style={{
                    backgroundColor: Colors.BACKGROUND,
                }}
            >
                <div className='flex gap-3'>
                    <textarea
                        placeholder={Lookup.INPUT_PLACEHOLDER}
                        value={userInput}
                        onChange={(event) => setUserInput(event.target.value)}
                        className='outline-none bg-transparent w-full h-32 max-h-56 resize-none'
                    />
                    {userInput && (
                        <ArrowRight
                            onClick={() => onGenerate(userInput)}
                            className='bg-blue-500 p-2 h-10 w-10 rounded-md cursor-pointer'
                        />
                    )}
                </div>
                <div>
                    <Link className='h-5 w-5' />
                </div>
            </div>
            </div>
        </div>
    );
}

export default ChatView;
