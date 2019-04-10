deps = read.csv(file="output-top-Deps.csv")
a <-paste(round((deps$value/6187)[1:10]*100, digits=0), "%", sep="")
setEPS()
postscript("topDeps.eps")
p <- barplot(deps$value[1:10], names.arg = F, las=2, ylim=c(0,550), ylab = '# of appearances', angle=90)
text(p, -10, srt = 60, adj= 1, xpd = TRUE, labels = deps$name[1:10] , cex=0.9)
text(p, deps$value[1:10] + 20, labels=a, xpd=TRUE)
dev.off()

sum(deps[1:10,]$value)/sum(deps$value) * 100


data <- read.csv(sep=";", file="output-pmiStatsPerPackage.csv", header=F)