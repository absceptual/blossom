import pymupdf 

from pathlib import Path



def get_problem_names(document):
    problem_names = []

    for i in range(0, document.page_count):

        page = document[i]
        if not page.search_for("Programming Problem Set"):
            continue

        words = page.get_text("words", sort=True)  # extract sorted words
        for i, word in enumerate(words):
            text = word[4]
            if text == "Problem" and words[i + 1][4] != "Set":
                name = words[i + 2][4]
                problem_names.append(name)
            
    return problem_names

def get_problem_statements(problem_names, name):

    doc = pymupdf.open(name)
    dup_doc = pymupdf.open(name) 
    
    start = 1
    end = 1
    # print(name)
    for i, problem_name in enumerate(problem_names):
        # print(f"current problem name: {problem_name}")
        next_problem = problem_names[i + 1] if i + 1 < len(problem_names) else None
        if next_problem is None:
            for i in range(start, doc.page_count):
                page = doc[i]
                if page.search_for(f"{problem_name}") and (page.search_for("cont") or page.search_for("continued")):
                    end = page.number
                    break

            if (start == end):
                dup_doc.select([i for i in range(start, end + 1)])
            else:
                dup_doc.select([i for i in range(start, end)])
            dup_doc.save(f"{problem_name.lower()}.pdf")
            dup_doc.close()
            dup_doc = pymupdf.open(name)
            continue

        for page in range(start, doc.page_count):
            page = doc[page]
            if page.search_for(f"{str(i + 1)}. {problem_name}"):
                start = page.number

            if page.search_for(f"{str(i + 2)}. {next_problem}"):
                end = page.number
                break


        
        if (start == end):
            dup_doc.select([i for i in range(start, end + 1)])
        else:
            dup_doc.select([i for i in range(start, end)])
        dup_doc.save(f"{problem_name.lower()}.pdf")
        dup_doc.close()
        dup_doc = pymupdf.open(name)



def main():
    files = Path('../pdfs')
    for root, dirs, files in files.walk(on_error=print):
        for name in files:
            document = pymupdf.open(f"{root}/{name}")
            problem_names = get_problem_names(document)

            print(f"problem names: {problem_names}")
            get_problem_statements(problem_names, f"{root}/{name}")


if __name__ == "__main__":
    main()

