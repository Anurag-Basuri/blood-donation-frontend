import toast from 'react-hot-toast';

export const showError = (message, type = 'success') => {
    toast(message, {
        duration: 3000,
        position: 'top-right',
        style: {
            background: type === 'error' ? 'red' : 'green',
            color: 'white',
        },
    });

    toast.dismiss();
}