import React, { useEffect, useState } from 'react'
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { HfInference } from "@huggingface/inference";

const ChatBotModal = (props) => {
  const [show, setShow] = useState(false);
  const [prompt, setprompt] = useState(false);


  const handleOpenModal = (e) => {
    if (e.detail === props.title) {
      setShow(true);
    }
  };

  const handleChange = (e) => {
    setprompt(e.target.value);
  }

  const HandleSubmit = async () => {
    try {
      const API_KEY = process.env.REACT_APP_AI_API_KEY;

      const client = new HfInference(API_KEY);

      const template = `Your task is to generate the body of a formal email based on the following topic. The email should be clear, professional, and directly related to the topic provided.

- Write in a formal and polite tone.
- The content should focus solely on the key points of the topic.
- Ensure that the grammar, spelling, and punctuation are correct.
- Do not include a subject line, greeting, or closing. Only provide the main body of the email, addressing the topic directly.

Here is the topic for the email:\n${prompt}`


      const chatCompletion = await client.chatCompletion({
        model: "meta-llama/Meta-Llama-3-8B-Instruct",
        messages: [
          {
            role: "user",
            content: template,
          },
        ],
        max_tokens: 500,
      });

      console.log(chatCompletion.choices[0].message.content)

    } catch (error) {
    } finally {
    }
  }

  const handleClose = () => {
    setShow(false)
  }

  useEffect(() => {
    window.addEventListener("open-modal", handleOpenModal);

    return () => {
      window.removeEventListener("open-modal", handleOpenModal);
    }
  }, [])

  return (
    <Modal show={show} animation={true} size="md" aria-labelledby="example-modal-sizes-title-sm" className='department-modal' centered>
      <Modal.Header className='small-modal'>
        <Modal.Title>Write Prompt</Modal.Title>
        <p className='close-modal' onClick={handleClose}><i className="fa-solid fa-xmark"></i></p>
      </Modal.Header>
      <Modal.Body>
        <div className=" grid-margin stretch-card inner-pages mb-lg-0">
          <div className="card">
            <div className="card-body">
              <form className="forms-sample">
                <div className="row mx-auto">
                  <div className="col-10">
                    <Form.Control type='text' name='prompt' id='reason' onChange={handleChange} />
                  </div>
                  <div className="col-1">
                    <button type="button" className="btn btn-gradient-primary mr-2" onClick={HandleSubmit}>Send</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  )
}

export default ChatBotModal
