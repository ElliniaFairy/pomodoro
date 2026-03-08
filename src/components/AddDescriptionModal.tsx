import { useState } from 'react';
interface AddDescriptionProp {
    originalDescription?: string
    addDescription: (description: string) => void
    onClose: () => void
}

function AddDescriptionModal({addDescription, onClose, originalDescription}: AddDescriptionProp) {
    const [description, setDescription] = useState<string>(originalDescription ?? '')
    const handleAddDescription = () => {
        addDescription(description)
        setDescription('')
        onClose()
    }
    return <div id="description-modal">
        <p> This is an add description modal. Enter task description below. </p>
        <input  type="text" 
                id="task-description" 
                value={description} 
                onChange={(e) => {setDescription(e.target.value)}}>
        </input>
        <button onClick={handleAddDescription}>Submit</button>
    </div>
        
}

export default AddDescriptionModal;
