class ContextManager:
    def __init__(self):
        self.context = {}

    def add_to_context(self, pdf_filename, question, answer):
        if pdf_filename not in self.context:
            self.context[pdf_filename] = []
        self.context[pdf_filename].append({"question": question, "answer": answer})

    def get_context(self, pdf_filename):
        return self.context.get(pdf_filename, [])

context_manager = ContextManager()