import lexical_analysis
import semantic_analysis
from json import dumps


lexical_analyzed, err = lexical_analysis.lexical_analysis('for i in 1...10:\n    print(i)')
if not err:
    print(dumps(lexical_analyzed, indent=4))
    semantic_analyzed, err2 = semantic_analysis.semantic_analysis(lexical_analyzed)
    print(semantic_analyzed)
    if not err2:
        print(dumps(semantic_analyzed, indent=4))
