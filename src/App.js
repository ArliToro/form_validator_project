import React, {useEffect} from "react";

function App() {
    const [apiContent, setApiContent] = React.useState([]);
    const [form, setForm] = React.useState({});
    const [emptyForm, setEmtyform] = React.useState({});
    const [onHold, setOnHold] = React.useState(false);
    const [onSuccess, setOnSuccess] = React.useState(false);
    const [animation, setAnimation] = React.useState(false);

    useEffect(() => {
        fetch("https://strapi-test-api.marinedatacloud.com/form")
            .then(respond => respond.json())
            .then(json => {
                //FIlls the form with the inputs name that comes form API
                let tmpForm = {...form};
                for (let i = 0; i < json.config.form_inputs.length; i++) {
                    tmpForm[json.config.form_inputs[i].name] = "";
                }
                setEmtyform(tmpForm);
                setForm(tmpForm);
                setApiContent(json.config.form_inputs);
            })
    }, []);

    //Save the changes in real time when the value of an input or select is changed
    const saveChanges = (e) => {
        setForm({...form, [e.target.name]: e.target.value})
    }

    //Get the values of the select on page load to take the default value
    const getSelectValues = () => {
        let inputs = document.querySelectorAll("select");
        for (let i = 0; i < inputs.length; i++) {
            setForm({...form, [inputs[i].name]: inputs[i].value})
        }
    }

    //Does the validation of the inputs or select
    const validateForm = () => {
        let errorCounter = 0;
        for (const key in form) {
            if (form[key].length < 3 || form[key].length > 65) {
                document.querySelector(".error_" + key).style.opacity = 1;
                errorCounter++;
            } else {
                document.querySelector(".error_" + key).style.opacity = 0;
            }
        }
        return errorCounter <= 0;
    }

    //Handles the submit form and server response
    const submitForm = (e) => {
        e.preventDefault();
        if (validateForm()) {
            setOnHold(true);
            const postForm = {"data": form};
            fetch("https://strapi-test-api.marinedatacloud.com/form-collections", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(postForm)
            }).then(response => {
                if (response.ok) {
                    setOnSuccess(true);
                }
                setAnimation(true);
                setTimeout(() => {
                    defaultForm();
                }, 4100);
            })
        }
    }

    //After the form is posted brings everything to a default state of empty inputs and select
    const defaultForm = () => {
        setForm(emptyForm);
        setOnSuccess(false);
        setOnHold(false);
        setAnimation(false);
    }

    return (
        <main>
            <div className={"form-wrapper"} style={onHold ? {pointerEvents: "none"} : {pointerEvents: "auto"}}>
                <h3>Add New User</h3>
                <form onSubmit={(e) => submitForm(e)}>
                    {apiContent.map(item => (
                        <div className={"inputs-design"}>
                            {item.type === "select" ? (
                                <>

                                    <label htmlFor={item.name}>{item.label}</label>
                                    <select name={item.name} defaultValue={item.default_value}
                                            onChange={(e) => saveChanges(e)}>
                                        {item.options.map(option => (
                                            <option value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                    <div className={"error_" + item.name + " error-design"}>
                                        {item.rules}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <label htmlFor={item.name}>{item.label}</label>
                                    <input type={item.type} name={item.name} value={form[item.name]}
                                           onChange={(e) => saveChanges(e)}/>
                                    <div className={"error_" + item.name + " error-design"}>
                                        {item.rules}
                                    </div>
                                </>)}
                        </div>
                    ))}
                    <button className={"submit-btn"} onClick={getSelectValues}>
                        Submit Form
                    </button>
                </form>
            </div>
            <div className={animation ? "server-respond server-respond-animation" : "server-respond"}>
                {onSuccess ? <h4 style={{color:"#28a745"}}>Everything went okay</h4> : <h4 style={{color:"#dc3545"}}>Something went wrong</h4>}
            </div>
        </main>
    );
}

export default App;
