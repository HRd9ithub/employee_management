import React, { useEffect, useRef, useState } from 'react';
import { customAxios } from '../../service/CreateApi';
import { marked } from "marked";

const ChatBot = () => {
  const [message, setMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const endOfMessagesRef = useRef(null);

  // input change
  const handleInputChange = (event) => {
    setMessage(event.target.value);
  }

  // send function
  const handleSend = async (e) => {
    e.preventDefault();
    displayMessage(message, true);
    setIsTyping(true);
    const data = message;
    setMessage("");
    try {
      const response = await customAxios().post('/geminiRoute', { userInput: data });
      
      if (response.data.success) {
        displayMessage(response.data.data);
      }
    } catch (error) {
      displayMessage('Sorry, there was an error. Please try again later.', false, true);
    }finally {
      setIsTyping(false);
    }
  }

  const displayMessage = (message, isUser = false, isError = false) => {
    setMessageList((prevMessages) => [
      ...prevMessages,
      { message: message, isUser, isError },
    ]);
  };

  // Scroll to bottom when messageList updates
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messageList]);

  return (
    <div className="container-fluid p-4">
      <div className="background-wrapper bg-white">
        <div className="chat-container px-4">
          {messageList.map((mess, index) => (
            <div className={`d-flex w-100 ${mess.isUser ? 'align-self-end' : 'align-self-start'}`}>
              <div className="chat-icon">
                {mess.isUser ? <i class="fa-solid fa-user"></i> : <i class="fa-solid fa-robot"></i>}
              </div>
              <div
                key={index}
                className={`chat-bubble ${mess.isUser ? 'user-bubble' : 'bot-bubble'}`}
              >
                <div className="chat-message" dangerouslySetInnerHTML={{__html: marked.parse(mess.message)}} ></div>
              </div>
            </div>
          ))}
          {isTyping && 
            <div className="d-flex align-items-center">
              <div className="chat-icon">
                <i class="fa-solid fa-robot"></i>
              </div>
              <p className='generating mb-0 ml-3'>Generating...</p>
            </div>
          }
          <div ref={endOfMessagesRef} /> {/* Dummy div for scrolling */}
        </div>
        <div className='chat-bot-form px-4'>
          <form className='d-flex gap-3 justify-content-between py-3' onSubmit={handleSend}>
            <input
              type="text"
              className='form-control mb-0 p-2'
              name='message'
              value={message}
              onChange={handleInputChange}
              placeholder='Ask Something...'
            />
            <button type='submit' className='btn btn-gradient-primary' disabled={isTyping}>Send</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ChatBot;
